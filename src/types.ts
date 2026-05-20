export interface RugRisk {
  name: string;
  level: string;
  description?: string;
}

export interface RugAnalysis {
  score: number | null;
  scoreNormalised: number | null;
  lpLockedPct: number | null;
  risks: RugRisk[];
  status: "good" | "warn" | "danger" | "error";
  warnings: RugRisk[];
  error?: string;
  url: string;
}

export interface Token {
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

export interface TokensResponse {
  tokens: Token[];
  fetchedAt: string;
}
