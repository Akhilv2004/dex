import type { RugAnalysis } from "../types";

const HEADING_LABELS: Record<RugAnalysis["status"], string> = {
  good: "Good",
  warn: "Caution",
  danger: "High risk",
  error: "Unavailable",
};

interface RugAnalysisCellProps {
  analysis: RugAnalysis | null;
}

export function RugAnalysisCell({ analysis }: RugAnalysisCellProps) {
  if (!analysis) {
    return <span className="rug-cell muted">—</span>;
  }

  const riskSummary =
    analysis.risks.length > 0
      ? analysis.risks.map((r) => r.name).join(" · ")
      : "No risks flagged";

  const tooltip = [
    analysis.error,
    analysis.scoreNormalised != null &&
      `Risk score: ${analysis.scoreNormalised}`,
    analysis.lpLockedPct != null && `LP locked: ${analysis.lpLockedPct}%`,
    riskSummary,
  ]
    .filter(Boolean)
    .join("\n");

  const displayRisks =
    analysis.status === "good" && analysis.warnings.length > 0
      ? analysis.warnings
      : analysis.status !== "good"
        ? analysis.risks
        : [];

  return (
    <a
      href={analysis.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`rug-cell rug-${analysis.status}`}
      title={tooltip}
    >
      <span className="rug-badges">
        <span className={`rug-badge rug-badge-${analysis.status}`}>
          {HEADING_LABELS[analysis.status]}
        </span>
        {analysis.status === "good" && analysis.warnings.length > 0 && (
          <span className="rug-badge rug-badge-warning-flag">Warning</span>
        )}
      </span>
      {analysis.status !== "error" && (
        <span className="rug-metrics">
          {analysis.scoreNormalised != null && (
            <span className="rug-score">Score {analysis.scoreNormalised}</span>
          )}
          {analysis.lpLockedPct != null && (
            <span className="rug-lp">LP {analysis.lpLockedPct}%</span>
          )}
        </span>
      )}
      {displayRisks.length > 0 && (
        <span className="rug-risks">
          {displayRisks.slice(0, 2).map((r) => r.name).join(" · ")}
          {displayRisks.length > 2 && ` +${displayRisks.length - 2}`}
        </span>
      )}
      {analysis.status === "error" && analysis.error && (
        <span className="rug-risks">{analysis.error}</span>
      )}
    </a>
  );
}
