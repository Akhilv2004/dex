const RUGCHECK_API = "https://api.rugcheck.xyz";

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
  /** RugCheck page heading: Good (<30), Warning (30–59), Danger (60+). */
  status: "good" | "warn" | "danger" | "error";
  /** Warn-level flags shown under a Good heading on RugCheck. */
  warnings: RugRisk[];
  error?: string;
  url: string;
}

interface RugCheckSummaryResponse {
  score?: number;
  score_normalised?: number;
  lpLockedPct?: number;
  risks?: {
    name: string;
    level: string;
    description?: string;
    value?: string;
  }[];
}

function rugCheckUrl(mint: string) {
  return `https://rugcheck.xyz/tokens/${mint}`;
}

/** Matches RugCheck.xyz heading bands (score_normalised 0–100). */
function deriveHeading(
  risks: RugRisk[],
  scoreNormalised: number | null
): RugAnalysis["status"] {
  if (risks.some((r) => r.level === "danger" || r.level === "critical")) {
    return "danger";
  }
  if (scoreNormalised != null) {
    if (scoreNormalised >= 60) return "danger";
    if (scoreNormalised >= 30) return "warn";
    return "good";
  }
  return "good";
}

export async function fetchRugAnalysis(mint: string): Promise<RugAnalysis> {
  const url = rugCheckUrl(mint);

  try {
    const res = await fetch(
      `${RUGCHECK_API}/v1/tokens/${mint}/report/summary`,
      {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(20_000),
      }
    );

    if (!res.ok) {
      throw new Error(`RugCheck ${res.status}`);
    }

    const data = (await res.json()) as RugCheckSummaryResponse;
    const risks: RugRisk[] = (data.risks ?? []).map((r) => ({
      name: r.name,
      level: r.level,
      description: r.description,
    }));

    const scoreNormalised = data.score_normalised ?? null;
    const status = deriveHeading(risks, scoreNormalised);
    const warnings = risks.filter((r) => r.level === "warn");

    return {
      score: data.score ?? null,
      scoreNormalised,
      lpLockedPct: data.lpLockedPct ?? null,
      risks,
      status,
      warnings: status === "good" ? warnings : [],
      url,
    };
  } catch (err) {
    return {
      score: null,
      scoreNormalised: null,
      lpLockedPct: null,
      risks: [],
      warnings: [],
      status: "error",
      error: err instanceof Error ? err.message : "RugCheck failed",
      url,
    };
  }
}

async function runPool<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrency: number
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;

  async function worker() {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index]);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, worker)
  );
  return results;
}

export async function fetchRugAnalyses(
  mints: string[],
  concurrency = 4
): Promise<Map<string, RugAnalysis>> {
  const map = new Map<string, RugAnalysis>();
  if (!mints.length) return map;

  const analyses = await runPool(
    mints,
    async (mint) => {
      const analysis = await fetchRugAnalysis(mint);
      return { mint: mint.toLowerCase(), analysis };
    },
    concurrency
  );

  for (const { mint, analysis } of analyses) {
    map.set(mint, analysis);
  }

  return map;
}
