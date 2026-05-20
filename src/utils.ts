/** Opens DEXScreener with the chart panel visible (embed/chart mode). */
export function dexscreenerChartUrl(
  pairUrl: string | null,
  dexscreenerUrl: string
): string {
  const base = pairUrl ?? dexscreenerUrl;
  const url = new URL(base);
  url.searchParams.set("embed", "1");
  url.searchParams.set("chart", "1");
  url.searchParams.set("theme", "dark");
  url.searchParams.set("info", "0");
  url.searchParams.set("trades", "0");
  url.searchParams.set("tabs", "0");
  return url.toString();
}

export function jupiterTradeUrl(tokenMint: string): string {
  return `https://jup.ag/swap/SOL-${tokenMint}`;
}

export function changeClass(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "";
  return value >= 0 ? "positive" : "negative";
}

export function shortenAddress(addr: string, chars = 4): string {
  if (addr.length <= chars * 2 + 2) return addr;
  return `${addr.slice(0, chars + 2)}…${addr.slice(-chars)}`;
}

export function formatMoney(
  value: number | null | undefined,
  compact = false
): string {
  if (value == null || Number.isNaN(value)) return "—";
  if (value === 0) return "$0";

  if (compact) {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  }

  if (value < 0.00001) return `$${value.toExponential(2)}`;
  if (value < 1) return `$${value.toFixed(6)}`;
  if (value < 1000) return `$${value.toFixed(4)}`;
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatTimeAgo(
  ts: number | string | null | undefined
): string {
  if (ts == null) return "—";
  const ms = typeof ts === "string" ? Date.parse(ts) : ts;
  if (Number.isNaN(ms)) return "—";

  const diff = Date.now() - ms;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(ms).toLocaleDateString();
}
