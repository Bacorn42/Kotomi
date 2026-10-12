const db = require("../../../database/db");

const insertConversation = db.prepare(`
    INSERT INTO ChatConversations (UserID, Title, Model)
    VALUES (?, 'New Chat', ?)
`);

const getConversationById = db.prepare(`
    SELECT *
    FROM ChatConversations
    WHERE ConversationID = ?
      AND UserID = ?
`);

const getUserConversations = db.prepare(`
    SELECT *
    FROM ChatConversations
    WHERE UserID = ?
    ORDER BY UpdatedDate DESC, ConversationID DESC
`);

const updateConversationTitle = db.prepare(`
    UPDATE ChatConversations
    SET Title = ?
    WHERE ConversationID = ?
      AND UserID = ?
`);

const updateConversationModel = db.prepare(`
    UPDATE ChatConversations
    SET Model = ?
    WHERE ConversationID = ?
      AND UserID = ?
`);

const updateConversationDate = db.prepare(`
    UPDATE ChatConversations
    SET UpdatedDate = CURRENT_TIMESTAMP
    WHERE ConversationID = ?
      AND UserID = ?
`);

const deleteConversation = db.prepare(`
    DELETE FROM ChatConversations
    WHERE ConversationID = ?
      AND UserID = ?
`);

function create(userId, model = null) {
    const result = insertConversation.run(userId, model);
    return result.lastInsertRowid;
}

function getById(id, userId) {
    return getConversationById.get(id, userId);
}

function getByUser(userId) {
    return getUserConversations.all(userId);
}

function rename(id, userId, title) {
    return updateConversationTitle.run(title, id, userId);
}

function setModel(id, userId, model) {
    return updateConversationModel.run(model, id, userId);
}

function touch(id, userId) {
    return updateConversationDate.run(id, userId);
}

function deleteById(id, userId) {
    return deleteConversation.run(id, userId);
}

module.exports = {
    create,
    getById,
    getByUser,
    rename,
    setModel,
    touch,
    deleteById,
};
