const conversationRepository = require("../repositories/conversationRepository");
const messageRepository = require("../repositories/messageRepository");
const ollama = require("../../../services/ollama");
const settingsRepository = require("../repositories/settingsRepository");

function listConversations(userId) {
    return conversationRepository.getByUser(userId);
}

function createConversation(userId, model = null) {
    const settings = settingsRepository.getByUser(userId);
    return conversationRepository.create(userId, model ?? settings.DefaultModel);
}

function getConversation(userId, conversationId) {
    const conversation = conversationRepository.getById(conversationId, userId);

    if (!conversation) {
        return null;
    }

    const messages = messageRepository.getByConversation(conversationId);

    return {
        ...conversation,
        messages,
    };
}

function deleteConversation(userId, conversationId) {
    const conversation = conversationRepository.getById(conversationId, userId);

    if (!conversation) {
        return false;
    }

    conversationRepository.deleteById(conversationId, userId);

    return true;
}

async function sendMessage(userId, conversationId, content, onChunk, options = {}) {
    const conversation = conversationRepository.getById(conversationId, userId);

    if (!conversation) {
        return null;
    }

    const userSettings = settingsRepository.getByUser(userId);
    let model = conversation.Model;

    if (!model) {
        model = userSettings.DefaultModel;

        if (!model) {
            const models = await ollama.getModels();

            if (models.length === 0) {
                throw new Error("No Ollama models are available.");
            }

            model = models[0].name;
        }

        conversationRepository.setModel(conversationId, userId, model);
    }

    const existingMessages = messageRepository.getByConversation(conversationId);

    messageRepository.save(conversationId, "user", content);

    if (existingMessages.length === 0) {
        const title = content.trim().slice(0, 40);

        conversationRepository.rename(conversationId, userId, title || "New Chat");
    }

    conversationRepository.touch(conversationId, userId);

    const messages = [
        ...existingMessages.map((message) => ({
            role: message.Role,
            content: message.Content,
        })),
        {
            role: "user",
            content,
        },
    ];

    const response = await ollama.streamChat(
        messages,
        model,
        {
            contextWindow: options.contextWindow ?? userSettings.ContextWindow,
            temperature: options.temperature ?? userSettings.Temperature,
            signal: options.signal,
        },
        onChunk,
    );

    const messageId = messageRepository.save(conversationId, "assistant", response);

    conversationRepository.touch(conversationId, userId);

    return {
        messageId,
        content: response,
        model,
    };
}

function getSettings(userId) {
    return settingsRepository.getByUser(userId);
}

async function updateSettings(userId, settings) {
    if (settings.defaultModel !== null) {
        const models = await ollama.getModels();

        if (!models.some((model) => model.name === settings.defaultModel)) {
            throw new Error("Selected model is not available.");
        }
    }

    return settingsRepository.save(userId, settings);
}

module.exports = {
    listConversations,
    createConversation,
    getConversation,
    deleteConversation,
    sendMessage,
    getSettings,
    updateSettings,
};
