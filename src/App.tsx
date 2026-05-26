import { useCallback, useEffect, useMemo, useState } from "react";
import type { Token } from "./types";
import { TokenTable } from "./components/TokenTable";
import { Filters } from "./components/Filters";

type SortKey = "newest" | "mcap" | "volume" | "liquidity";

export default function App() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");

  const load = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/tokens");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      setTokens(data.tokens);
      setFetchedAt(data.fetchedAt);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, [load]);

  const filtered = useMemo(() => {
    let list = tokens;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.symbol.toLowerCase().includes(q) ||
          t.name.toLowerCase().includes(q) ||
          t.tokenAddress.toLowerCase().includes(q)
      );
    }

    const sorted = [...list];
    switch (sort) {
      case "mcap":
        sorted.sort((a, b) => (b.marketCap ?? 0) - (a.marketCap ?? 0));
        break;
      case "volume":
        sorted.sort((a, b) => (b.volume24h ?? 0) - (a.volume24h ?? 0));
        break;
      case "liquidity":
        sorted.sort((a, b) => (b.liquidityUsd ?? 0) - (a.liquidityUsd ?? 0));
        break;
      default:
        sorted.sort((a, b) => {
          const ta =
            a.pairCreatedAt ?? (a.listedAt ? Date.parse(a.listedAt) : 0);
          const tb =
            b.pairCreatedAt ?? (b.listedAt ? Date.parse(b.listedAt) : 0);
          return tb - ta;
        });
    }
    return sorted;
  }, [tokens, search, sort]);

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="brand">
            <span className="brand-dot" />
            <div>
              <h1>Sol meme info tracker</h1>
              <p className="tagline">
                Solana memecoins with essential informatiom to purchase coins.I am not responsible for any kind of scams or losses.
              </p>
            </div>
          </div>
          <div className="header-actions">
            <button
              type="button"
              className="btn-refresh"
              onClick={() => {
                setLoading(true);
                load();
              }}
              disabled={loading}
            >
              {loading ? "Refreshing…" : "Refresh"}
            </button>
            {fetchedAt && (
              <span className="fetched-at">
                Updated {new Date(fetchedAt).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="main">

        
         <aside className="notice">
           <strong>Disclaimer</strong> I am not responsible for any financial losses. Do your own research before interacting with any of these tokens.This site will give you data about the coin.
         </aside>

        <Filters
          search={search}
          onSearchChange={setSearch}
          sort={sort}
          onSortChange={setSort}
          count={filtered.length}
          total={tokens.length}
        />

        {error && (
          <div className="error-banner" role="alert">
            {error}
            <button type="button" onClick={load}>
              Retry
            </button>
          </div>
        )}

        {loading && tokens.length === 0 ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading memecoins &amp; RugCheck analysis…</p>
          </div>
        ) : (
          <TokenTable tokens={filtered} />
        )}
      </main>

      <footer className="footer">
        Data from{" "}
        <a
          href="https://docs.dexscreener.com/api/reference"
          target="_blank"
          rel="noopener noreferrer"
        >
          DEXScreener API {" "} </a>and{" "}
          <a
          href="https://api.rugcheck.xyz"
          target="_blank"
          rel="noopener noreferrer"
          >Rugcheck.xyz API</a>
        
        . Not financial advice.
      </footer>
    </div>
  );
}
