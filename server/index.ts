import cors from "cors";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { aggregateLatestTokens } from "./dexscreener.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3001;
const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/tokens", async (_req, res) => {
  try {
    const tokens = await aggregateLatestTokens();
    res.json({ tokens, fetchedAt: new Date().toISOString() });
  } catch (err) {
    console.error("Failed to fetch tokens:", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Failed to fetch tokens",
    });
  }
});

const distPath = path.join(__dirname, "../dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"), (err) => {
      if (err) res.status(404).send("Not found");
    });
  });
}

app.listen(PORT, () => {
  console.log(`API server http://localhost:${PORT}`);
});
