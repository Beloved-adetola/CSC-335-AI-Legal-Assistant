// src/routes/assistant.js
const express = require("express");
const router = express.Router();
const { callOpenRouter } = require("../lib/aiClient");
const prisma = require("../lib/prismaClient");
const verifyFirebase = require("../middleware/verifyFirebase");


// POST /api/assistant
// body: { conversationId?: string, question: string, systemPrompt?: string }
router.post("/", verifyFirebase, async (req, res) => {
  try {
    const { question, conversationId, systemPrompt } = req.body;
    if (!question) return res.status(400).json({ error: "question required" });

    // determine user id from req.user
    const rawUser = req.user;
    if (!rawUser) return res.status(401).json({ error: "Unauthorized" });
    const userId = (typeof rawUser === "string") ? rawUser : (rawUser.id || rawUser.uid || rawUser.userId);
    if (!userId) return res.status(401).json({ error: "Unauthorized (no user id)" });

    // ensure DB user exists
    let dbUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!dbUser) {
      dbUser = await prisma.user.create({ data: { id: userId, email: rawUser.email ?? null } });
    }

    // load or create conversation
    let conversation = null;
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
      if (!conversation || conversation.userId !== userId) {
        return res.status(404).json({ error: "Conversation not found" });
      }
    } else {
      conversation = await prisma.conversation.create({
        data: { title: question.slice(0, 120), userId }
      });
    }

    // save user message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: question
      }
    });

    // build messages for model (system prompt + last N messages)
    let messages = [];
    if (systemPrompt) messages.push({ role: "system", content: systemPrompt });

    const prev = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "asc" },
      take: 50
    });

    for (const m of prev) {
      messages.push({ role: m.role, content: m.content });
    }
    // include latest user question (already saved but include for context)
    messages.push({ role: "user", content: question });

    // call AI
    const aiResp = await callOpenRouter(messages);
    const assistantText = (aiResp && aiResp.assistant) ? aiResp.assistant.trim() : "No response from model";

    // save assistant message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "assistant",
        content: assistantText
      }
    });

    return res.json({ conversationId: conversation.id, assistant: assistantText, raw: aiResp.raw ?? null });
  } catch (err) {
    console.error("assistant error", err);
    return res.status(500).json({ error: err.message || "internal" });
  }
});

module.exports = router;
