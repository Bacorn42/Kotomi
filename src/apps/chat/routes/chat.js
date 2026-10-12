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

    res.status(201).json({ conversationId });
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

router.post("/conversations/:id/messages", async (req, res) => {
    const conversationId = Number(req.params.id);
    const content = req.body?.content;

    if (!Number.isSafeInteger(conversationId) || conversationId <= 0) {
        return res.status(400).json({
            error: "Invalid conversation ID.",
        });
    }

    if (typeof content !== "string" || content.trim().length === 0 || content.length > 100000) {
        return res.status(400).json({
            error: "Message must contain between 1 and 100000 characters.",
        });
    }

    const conversation = chatService.getConversation(req.user.UserID, conversationId);

    if (!conversation) {
        return res.status(404).json({
            error: "Conversation not found.",
        });
    }

    res.status(200);
    res.set({
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
    });
    res.flushHeaders();

    const sendEvent = (event, data) => {
        if (res.destroyed || res.writableEnded) {
            return;
        }

        res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    const abortController = new AbortController();

    res.on("close", () => {
        if (!res.writableEnded) {
            abortController.abort();
        }
    });

    try {
        const result = await chatService.sendMessage(
            req.user.UserID,
            conversationId,
            content.trim(),
            (chunk) => sendEvent("chunk", { content: chunk }),
            {
                signal: abortController.signal,
            },
        );

        if (result) {
            sendEvent("done", {
                messageId: result.messageId,
                model: result.model,
            });
        }
    } catch (error) {
        console.error("Chat generation error:", error.message);
        sendEvent("error", {
            error: "Unable to generate a response.",
        });
    } finally {
        if (!res.destroyed) {
            res.end();
        }
    }
});

router.get("/settings", (req, res) => {
    res.json(chatService.getSettings(req.user.UserID));
});

router.put("/settings", async (req, res) => {
    const { defaultModel, contextWindow, temperature } = req.body ?? {};

    if (defaultModel !== null && (typeof defaultModel !== "string" || !defaultModel.trim())) {
        return res.status(400).json({
            error: "Invalid default model.",
        });
    }

    if (
        !Number.isSafeInteger(contextWindow) ||
        contextWindow < 512 ||
        contextWindow > 131072 ||
        typeof temperature !== "number" ||
        !Number.isFinite(temperature) ||
        temperature < 0 ||
        temperature > 2
    ) {
        return res.status(400).json({
            error: "Invalid settings.",
        });
    }

    try {
        const settings = await chatService.updateSettings(req.user.UserID, {
            defaultModel: defaultModel?.trim() || null,
            contextWindow,
            temperature,
        });

        res.json(settings);
    } catch (error) {
        if (error.message === "Selected model is not available.") {
            return res.status(400).json({ error: error.message });
        }

        console.error("Unable to update chat settings:", error.message);
        res.status(500).json({ error: "Unable to update settings." });
    }
});

module.exports = router;
