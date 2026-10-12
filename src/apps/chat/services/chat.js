const conversationRepository = require("../repositories/conversationRepository");
const messageRepository = require("../repositories/messageRepository");

function listConversations(userId) {
    return conversationRepository.getByUser(userId);
}

function createConversation(userId, model = null) {
    return conversationRepository.create(userId, model);
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

module.exports = {
    listConversations,
    createConversation,
    getConversation,
    deleteConversation,
};
