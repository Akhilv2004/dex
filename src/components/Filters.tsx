type SortKey = "newest" | "mcap" | "volume" | "liquidity";

interface FiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  sort: SortKey;
  onSortChange: (v: SortKey) => void;
  count: number;
  total: number;
}

export function Filters({
  search,
  onSearchChange,
  sort,
  onSortChange,
  count,
  total,
}: FiltersProps) {
  return (
    <div className="filters">
      <input
        type="search"
        className="search-input"
        placeholder="Search symbol, name, or address…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        aria-label="Search memecoins"
      />

      <select
        className="select"
        value={sort}
        onChange={(e) => onSortChange(e.target.value as SortKey)}
        aria-label="Sort memecoins"
      >
        <option value="newest">Newest first</option>
        <option value="mcap">Market cap</option>
        <option value="volume">24h volume</option>
        <option value="liquidity">Liquidity</option>
      </select>

      <span className="count-badge">
        {count} / {total} memecoins
      </span>
    </div>
  );
}
