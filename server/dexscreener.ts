import { isSolanaChain, isSolanaMemecoin } from "./memecoin.js";
import { fetchRugAnalyses, type RugAnalysis } from "./rugcheck.js";

const API_BASE = "https://api.dexscreener.com";

export interface TokenProfile {
  url: string;
  chainId: string;
  tokenAddress: string;
  icon?: string;
  header?: string;
  description?: string;
  links?: { type?: string; label?: string; url: string }[];
  updatedAt?: string;
}

export interface DexPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: { address: string; name: string; symbol: string };
  quoteToken: {
    address: string | null;
    name: string | null;
    symbol: string | null;
  };
  priceNative?: string;
  priceUsd?: string | null;
  txns?: Record<string, { buys: number; sells: number }>;
  volume?: Record<string, number>;
  priceChange?: Record<string, number>;
  liquidity?: { usd?: number | null; base?: number; quote?: number };
  fdv?: number | null;
  marketCap?: number | null;
  pairCreatedAt?: number | null;
  info?: {
    imageUrl?: string | null;
    websites?: { url: string; label?: string }[];
    socials?: { url: string; type?: string }[];
  };
}

export interface EnrichedToken {
  chainId: string;
  tokenAddress: string;
  symbol: string;
  name: string;
  priceUsd: number | null;
  priceChange1h: number | null;
  priceChange6h: number | null;
  priceChange24h: number | null;
  marketCap: number | null;
  liquidityUsd: number | null;
  volume24h: number | null;
  pairCreatedAt: number | null;
  listedAt: string | null;
  dexId: string | null;
  icon: string | null;
  description: string | null;
  dexscreenerUrl: string;
  pairUrl: string | null;
  rugAnalysis: RugAnalysis | null;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`DEXScreener ${res.status}: ${url}`);
  return res.json() as Promise<T>;
}

function tokenKey(chainId: string, tokenAddress: string) {
  return `${chainId}:${tokenAddress.toLowerCase()}`;
}

function pickPrimaryPair(pairs: DexPair[]): DexPair | null {
  if (!pairs.length) return null;
  return [...pairs].sort((a, b) => {
    const liqA = a.liquidity?.usd ?? 0;
    const liqB = b.liquidity?.usd ?? 0;
    if (liqB !== liqA) return liqB - liqA;
    return (b.pairCreatedAt ?? 0) - (a.pairCreatedAt ?? 0);
  })[0];
}

async function fetchPairsBatch(
  chainId: string,
  addresses: string[]
): Promise<Map<string, DexPair>> {
  const map = new Map<string, DexPair>();
  const chunkSize = 30;

  for (let i = 0; i < addresses.length; i += chunkSize) {
    const chunk = addresses.slice(i, i + chunkSize);
    const joined = chunk.join(",");
    const pairs = await fetchJson<DexPair[]>(
      `${API_BASE}/tokens/v1/${chainId}/${joined}`
    );

    const byToken = new Map<string, DexPair[]>();
    for (const pair of pairs) {
      const addr = pair.baseToken.address.toLowerCase();
      const list = byToken.get(addr) ?? [];
      list.push(pair);
      byToken.set(addr, list);
    }

    for (const [addr, tokenPairs] of byToken) {
      const primary = pickPrimaryPair(tokenPairs);
      if (primary) map.set(addr, primary);
    }

    if (i + chunkSize < addresses.length) {
      await sleep(350);
    }
  }

  return map;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function normalizeIcon(icon: string | null): string | null {
  if (!icon) return null;
  if (icon.startsWith("http")) return icon;
  return `https://cdn.dexscreener.com/cms/images/${icon}?width=64&height=64&fit=crop&quality=95&format=auto`;
}

export async function aggregateLatestTokens(): Promise<EnrichedToken[]> {
  const profiles = await fetchJson<TokenProfile[]>(
    `${API_BASE}/token-profiles/latest/v1`
  );

  const solanaProfiles = profiles.filter((p) => isSolanaChain(p.chainId));

  const pairMap = new Map<string, DexPair>();
  if (solanaProfiles.length > 0) {
    const addresses = solanaProfiles.map((p) => p.tokenAddress);
    const batch = await fetchPairsBatch("solana", addresses);
    for (const [addr, pair] of batch) {
      pairMap.set(tokenKey("solana", addr), pair);
    }
  }

  const tokens: EnrichedToken[] = [];

  for (const profile of solanaProfiles) {
    const key = tokenKey(profile.chainId, profile.tokenAddress);
    const pair = pairMap.get(key) ?? null;

    const symbol = pair?.baseToken.symbol ?? "???";
    const name = pair?.baseToken.name ?? "Unknown";

    if (!isSolanaMemecoin(profile.chainId, profile.tokenAddress, pair, symbol)) {
      continue;
    }

    tokens.push({
      chainId: profile.chainId,
      tokenAddress: profile.tokenAddress,
      symbol,
      name,
      priceUsd: pair?.priceUsd ? Number(pair.priceUsd) : null,
      priceChange1h: pair?.priceChange?.h1 ?? null,
      priceChange6h: pair?.priceChange?.h6 ?? null,
      priceChange24h: pair?.priceChange?.h24 ?? null,
      marketCap: pair?.marketCap ?? pair?.fdv ?? null,
      liquidityUsd: pair?.liquidity?.usd ?? null,
      volume24h: pair?.volume?.h24 ?? null,
      pairCreatedAt: pair?.pairCreatedAt ?? null,
      listedAt: profile.updatedAt ?? null,
      dexId: pair?.dexId ?? null,
      icon: normalizeIcon(profile.icon ?? pair?.info?.imageUrl ?? null),
      description: profile.description ?? null,
      dexscreenerUrl: profile.url,
      pairUrl: pair?.url ?? null,
      rugAnalysis: null,
    });
  }

  tokens.sort((a, b) => {
    const timeA = a.pairCreatedAt ?? (a.listedAt ? Date.parse(a.listedAt) : 0);
    const timeB = b.pairCreatedAt ?? (b.listedAt ? Date.parse(b.listedAt) : 0);
    return timeB - timeA;
  });

  const rugMap = await fetchRugAnalyses(tokens.map((t) => t.tokenAddress));

  for (const token of tokens) {
    token.rugAnalysis =
      rugMap.get(token.tokenAddress.toLowerCase()) ?? null;
  }

  return tokens;
}
