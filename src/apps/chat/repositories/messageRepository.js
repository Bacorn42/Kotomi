const db = require("../../../database/db");

const insertMessage = db.prepare(`
    INSERT INTO ChatMessages (
        ConversationID,
        Role,
        Content
    )
    VALUES (?, ?, ?)
`);

const getMessagesByConversation = db.prepare(`
    SELECT *
    FROM ChatMessages
    WHERE ConversationID = ?
    ORDER BY MessageID ASC
`);

const updateMessageContent = db.prepare(`
    UPDATE ChatMessages
    SET Content = ?
    WHERE MessageID = ?
`);

function save(conversationId, role, content) {
    const result = insertMessage.run(conversationId, role, content);

    return result.lastInsertRowid;
}

function getByConversation(conversationId) {
    return getMessagesByConversation.all(conversationId);
}

function updateContent(messageId, content) {
    return updateMessageContent.run(content, messageId);
}

module.exports = {
    save,
    getByConversation,
    updateContent,
};
