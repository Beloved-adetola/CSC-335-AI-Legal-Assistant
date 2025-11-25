const express = require("express");
const router = express.Router();
const prisma = require("../lib/prismaClient");
const verifyFirebase = require("../middleware/verifyFirebase");

// GET /api/conversations
router.get("/", verifyFirebase, async (req, res) => {
  const convos = await prisma.conversation.findMany({
    where: { userId: req.user.id },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
    orderBy: { updatedAt: 'desc' }
  });
  res.json(convos);
});

// GET /api/conversations/:id
router.get("/:id", verifyFirebase, async (req, res) => {
  const c = await prisma.conversation.findUnique({
    where: { id: req.params.id },
    include: { messages: { orderBy: { createdAt: 'asc' } } }
  });
  if (!c || c.userId !== req.user.id) return res.status(404).json({ error: "not found" });
  res.json(c);
});

// DELETE /api/conversations/:id
// DELETE /conversations/:id
router.delete("/:id", verifyFirebase, async (req, res) => {
  try {
    const convo = await prisma.conversation.findUnique({
      where: { id: req.params.id }
    });

    if (!convo || convo.userId !== req.user.id) {
      return res.status(404).json({ error: "not found" });
    }

    // 1️⃣ Delete all messages first
    await prisma.message.deleteMany({
      where: { conversationId: convo.id }
    });

    // 2️⃣ Delete the conversation
    await prisma.conversation.delete({
      where: { id: convo.id }
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    return res.status(500).json({ error: "server error", details: err.message });
  }
});


module.exports = router;
