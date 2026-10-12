const express = require("express");
const router = express.Router();

const { requireLogin } = require("../../../middleware/auth");
const chatService = require("../services/chat");

router.use(requireLogin);

router.get("/conversations", (req, res) => {
    const conversations = chatService.listConversations(req.user.UserID);

    res.json(conversations);
});

router.post("/conversations", (req, res) => {
    const model = req.body?.model ?? null;

    if (model !== null && (typeof model !== "string" || model.trim().length === 0)) {
        return res.status(400).json({
            error: "Invalid model.",
        });
    }

    const conversationId = chatService.createConversation(req.user.UserID, model);

    res.status(201).json({
        conversationId,
    });
});

router.get("/conversations/:id", (req, res) => {
    const conversationId = Number(req.params.id);

    if (!Number.isSafeInteger(conversationId) || conversationId <= 0) {
        return res.status(400).json({
            error: "Invalid conversation ID.",
        });
    }

    const conversation = chatService.getConversation(req.user.UserID, conversationId);

    if (!conversation) {
        return res.status(404).json({
            error: "Conversation not found.",
        });
    }

    res.json(conversation);
});

router.delete("/conversations/:id", (req, res) => {
    const conversationId = Number(req.params.id);

    if (!Number.isSafeInteger(conversationId) || conversationId <= 0) {
        return res.status(400).json({
            error: "Invalid conversation ID.",
        });
    }

    const deleted = chatService.deleteConversation(req.user.UserID, conversationId);

    if (!deleted) {
        return res.status(404).json({
            error: "Conversation not found.",
        });
    }

    res.status(204).end();
});

module.exports = router;
