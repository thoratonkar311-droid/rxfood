const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

// Load drug data
const drugs = require("./drugs.json");

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(__dirname));

// API route
app.get("/api/drugs", (req, res) => {
  res.json(drugs);
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "2.0.0"
  });
});

// Default route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 RxFood server running on port ${PORT}`);
});
