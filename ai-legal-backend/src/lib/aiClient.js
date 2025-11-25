// aiClient.js
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

/* ----------------------------------------------------
   Output Cleaning Utilities
---------------------------------------------------- */

/** Remove annoying markdown formatting, double newlines, etc. */
function cleanAssistantText(text = "") {
  if (!text) return "";

  return text
    .replace(/^\s+/, "")                                 // trim leading whitespace
    .replace(/```(json|text)?/g, "")                     // remove fenced code blocks
    .replace(/\*\*(.*?)\*\*/g, "$1")                    // remove bold markup
    .replace(/\*(.*?)\*/g, "$1")                        // remove italic markup
    .replace(/#+\s*/g, "")                              // remove markdown headers
    .replace(/\n{3,}/g, "\n\n")                         // compress huge gaps
    .trim();
}

/** Extract safe assistant text from OpenRouter response */
function extractAssistantMessage(data) {
  const msg = data?.choices?.[0]?.message?.content || "";
  return cleanAssistantText(msg);
}


/* ----------------------------------------------------
   Main OpenRouter Client
---------------------------------------------------- */

async function callOpenRouter(messages) {
  const model = process.env.OPENROUTER_MODEL || "x-ai/grok-4.1-fast";
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("Missing OPENROUTER_API_KEY in .env");
  }

  // Provide a default system prompt if none exists
  if (!messages.some(m => m.role === "system")) {
    messages.unshift({
      role: "system",
      content:
        "You are LegaLens, an AI Legal Assistant. Your job is to provide clear, accurate, jurisdiction-neutral explanations of legal concepts. Use simple language, avoid unnecessary jargon, and structure answers cleanly. If the user describes a situation, identify the key legal issues and explain them logically. Do not give definitive legal conclusions; instead, explain possibilities and advise consulting a qualified lawyer for actual legal decisions."
    });
  }

  const url = "https://openrouter.ai/api/v1/chat/completions";

  const body = {
    model,
    messages,
    max_tokens: Number(process.env.OPENROUTER_MAX_TOKENS || 600),
    temperature: Number(process.env.OPENROUTER_TEMPERATURE || 0.2)
  };

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`,
    "HTTP-Referer": process.env.APP_URL || "http://localhost:4000",
    "X-Title": "Lexi Legal Assistant"
  };

  let resp;
  try {
    resp = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });
  } catch (err) {
    throw new Error("Network error contacting OpenRouter: " + err.message);
  }

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`OpenRouter error ${resp.status}: ${errText}`);
  }

  const data = await resp.json();
  return {
    assistant: extractAssistantMessage(data),
    raw: data
  };
}

export { callOpenRouter };
