const express = require('express');
const cors = require('cors');
const path = require('path');
const drugsRouter = require('./routes/drugs');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ─────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Serve frontend static files ────────────────────────────
app.use(express.static(path.join(__dirname, '../frontend')));

// ── API Routes ─────────────────────────────────────────────
app.use('/api', drugsRouter);

// ── Health check ───────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '2.0.0' });
});

// ── Serve frontend for any unmatched route (SPA fallback) ──
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ── Start server ───────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 RxFood server running on http://localhost:${PORT}`);
  console.log(`   API:       http://localhost:${PORT}/api/drugs`);
  console.log(`   Health:    http://localhost:${PORT}/health`);
  console.log(`   Dashboard: http://localhost:${PORT}/dashboard.html\n`);
});

module.exports = app;
