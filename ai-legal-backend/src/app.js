// src/app.js
const express = require("express");
const cors = require("cors");
const assistantRoutes = require("./routes/assistant");
const conversations = require("./routes/conversations");

const app = express();
app.use(express.json());

const origins = (process.env.CORS_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: function(origin, cb) {
    if (!origin) return cb(null, true); // allow curl/Postman/no-origin
    if (origins.length === 0) return cb(null, true);
    if (origins.indexOf(origin) !== -1) return cb(null, true);
    cb(new Error("CORS not allowed"));
  },
  credentials: true
}));

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/assistant", assistantRoutes);
app.use("/api/conversations", conversations);

app.use((err, req, res, next) => {
  console.error("app error:", err && err.message || err);
  res.status(500).json({ error: err.message || "internal" });
});

module.exports = app;
