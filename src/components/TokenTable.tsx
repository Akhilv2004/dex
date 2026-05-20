import type { Token } from "../types";
import { RugAnalysisCell } from "./RugAnalysisCell";
import {
  changeClass,
  dexscreenerChartUrl,
  formatMoney,
  formatPercent,
  formatTimeAgo,
  jupiterTradeUrl,
  shortenAddress,
} from "../utils";

interface TokenTableProps {
  tokens: Token[];
}

function ChangeCell({ value }: { value: number | null }) {
  return (
    <td className={`mono ${changeClass(value)}`}>{formatPercent(value)}</td>
  );
}

export function TokenTable({ tokens }: TokenTableProps) {
  if (tokens.length === 0) {
    return (
      <p className="empty-state">No memecoins match your search.</p>
    );
  }

  return (
    <div className="table-wrap">
      <table className="token-table">
        <thead>
          <tr>
            <th>Token</th>
            <th>RUG analysis</th>
            <th>DEX</th>
            <th>Price</th>
            <th>1h</th>
            <th>6h</th>
            <th>24h</th>
            <th>Mkt cap</th>
            <th>Liquidity</th>
            <th>Vol 24h</th>
            <th>Created</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((token) => (
            <tr key={`${token.chainId}-${token.tokenAddress}`}>
              <td className="cell-token">
                <a
                  href={token.dexscreenerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="token-link"
                >
                  {token.icon ? (
                    <img
                      src={token.icon}
                      alt=""
                      className="token-icon"
                      loading="lazy"
                    />
                  ) : (
                    <span className="token-icon placeholder" />
                  )}
                  <span className="token-meta">
                    <span className="symbol">{token.symbol}</span>
                    <span className="name" title={token.name}>
                      {token.name}
                    </span>
                    <span className="address" title={token.tokenAddress}>
                      {shortenAddress(token.tokenAddress)}
                    </span>
                  </span>
                </a>
              </td>
              <td className="cell-rug">
                <RugAnalysisCell analysis={token.rugAnalysis} />
              </td>
              <td>
                {token.dexId ? (
                  <span className="dex-pill">{token.dexId}</span>
                ) : (
                  <span className="muted">—</span>
                )}
              </td>
              <td className="mono">{formatMoney(token.priceUsd)}</td>
              <ChangeCell value={token.priceChange1h} />
              <ChangeCell value={token.priceChange6h} />
              <ChangeCell value={token.priceChange24h} />
              <td className="mono">{formatMoney(token.marketCap, true)}</td>
              <td className="mono">{formatMoney(token.liquidityUsd, true)}</td>
              <td className="mono">{formatMoney(token.volume24h, true)}</td>
              <td className="mono muted">
                {formatTimeAgo(token.pairCreatedAt ?? token.listedAt)}
              </td>
              <td>
                <span className="action-links">
                  <a
                    href={dexscreenerChartUrl(
                      token.pairUrl,
                      token.dexscreenerUrl
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    chart
                  </a>
                  <span className="action-sep">/</span>
                  <a
                    href={jupiterTradeUrl(token.tokenAddress)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    trade
                  </a>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
