// list‑gemini‑models.js

require("dotenv").config();

const fetch = (...args) =>
    import("node-fetch").then(({ default: f }) => f(...args));
  
  async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.error("Set GEMINI_API_KEY in .env first");
      process.exit(1);
    }
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    try {
      const resp = await fetch(url);
      if (!resp.ok) {
        console.error("Error fetching models:", resp.status, await resp.text());
        process.exit(1);
      }
      const data = await resp.json();
      if (!Array.isArray(data.models)) {
        console.error("Unexpected response:", data);
        process.exit(1);
      }
      console.log("Available Gemini models:");
      for (const m of data.models) {
        console.log("-", m.name, "| supportedGenerationMethods:", m.supportedGenerationMethods);
      }
    } catch (e) {
      console.error("Request failed:", e);
      process.exit(1);
    }
  }
  
  listModels();
  