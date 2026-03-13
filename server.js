// RxFood Server (Production Ready)

const express = require("express");
const cors = require("cors");
const path = require("path");

const drugsRouter = require("./routes/drugs");

const app = express();

// Render provides the PORT automatically
const PORT = process.env.PORT || 10000;

// ── Middleware ─────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Serve Frontend Static Files ────────────────────────────
const frontendPath = path.join(__dirname, "../frontend");
app.use(express.static(frontendPath));

// ── API Routes ─────────────────────────────────────────────
app.use("/api", drugsRouter);

// ── Root Route ─────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send("🚀 RxFood API is running");
});

// ── Health Check Route ─────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "RxFood API",
    version: "2.0.0",
    timestamp: new Date().toISOString()
  });
});

// ── SPA Fallback (for frontend routing) ────────────────────
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ── Start Server ───────────────────────────────────────────
app.listen(PORT, () => {
  console.log("=====================================");
  console.log("🚀 RxFood Server Started Successfully");
  console.log(`🌍 Server URL: http://localhost:${PORT}`);
  console.log(`📡 API:        /api/drugs`);
  console.log(`💚 Health:     /health`);
  console.log("=====================================");
});

module.exports = app;
