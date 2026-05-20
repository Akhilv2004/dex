const SOLANA = "solana";

interface MemePairInfo {
  dexId?: string;
  baseToken?: { symbol?: string };
  marketCap?: number | null;
  fdv?: number | null;
}

/** Wrapped SOL, stables, and other non-meme base tokens */
const EXCLUDED_TOKEN_ADDRESSES = new Set(
  [
    "So11111111111111111111111111111111111111112",
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
    "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
    "7dHbWXmci3dT8UFYWYZweBLXgzc6eqt4G6j8w6pF8Kk",
    "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
  ].map((a) => a.toLowerCase())
);

const EXCLUDED_SYMBOLS = new Set([
  "SOL",
  "WSOL",
  "USDC",
  "USDT",
  "JUP",
  "MSOL",
  "STSOL",
  "BONK",
  "WIF",
  "PYUSD",
  "USD1",
]);

/** DEXes where Solana memecoins typically launch or trade */
const MEME_DEX_IDS = new Set([
  "pumpswap",
  "pumpfun",
  "pump",
  "launchlab",
  "moonshot",
  "meteora",
  "raydium",
  "orca",
]);

export function isSolanaChain(chainId: string): boolean {
  return chainId.toLowerCase() === SOLANA;
}

export function isSolanaMemecoin(
  chainId: string,
  tokenAddress: string,
  pair: MemePairInfo | null,
  symbol?: string
): boolean {
  if (!isSolanaChain(chainId)) return false;

  const addr = tokenAddress.toLowerCase();
  if (EXCLUDED_TOKEN_ADDRESSES.has(addr)) return false;

  const sym = (symbol ?? pair?.baseToken.symbol ?? "").toUpperCase();
  if (EXCLUDED_SYMBOLS.has(sym)) return false;

  // pump.fun mints end in "pump"
  if (addr.endsWith("pump")) return true;

  const dex = pair?.dexId?.toLowerCase();
  if (!dex || !MEME_DEX_IDS.has(dex)) return false;

  // On generic DEXes, require a meme launchpad pair or very small cap
  if (dex === "raydium" || dex === "orca" || dex === "meteora") {
    const mcap = pair?.marketCap ?? pair?.fdv ?? null;
    if (mcap != null && mcap > 25_000_000) return false;
  }

  return true;
}
