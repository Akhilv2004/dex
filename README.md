# Solana Memecoins

Live dashboard of **Solana memecoins with a DEXScreener profile** — from `/token-profiles/latest/v1`, enriched with price and market data.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The Vite dev server proxies `/api` to the Express backend on port 3001.

## Production

```bash
npm run build
npm start
```

Serves the built frontend and API on port 3001.

## API limitation

Only Solana memecoins are shown (pump.fun `…pump` mints, meme DEXes; majors like SOL, USDC, BONK excluded).

DEXScreener’s public API does not expose every new pair globally. This app uses `/token-profiles/latest/v1` enriches each token via `/tokens/v1/{chainId}/{addresses}`, and runs [RugCheck](https://rugcheck.xyz) analysis per mint.

Rate limits apply (60 req/min for profile endpoints). The UI auto-refreshes every 60 seconds.
