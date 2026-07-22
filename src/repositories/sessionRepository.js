const db = require("../database/db");

function createSession(sessionId, userId, expiresDate) {
    const statement = db.prepare(`
        INSERT INTO Sessions
        (
            SessionID,
            UserID,
            ExpiresDate
        )
        VALUES (?, ?, ?)
    `);

    statement.run(sessionId, userId, expiresDate);
}

function getSession(sessionId) {
    const statement = db.prepare(`
        SELECT
            Sessions.SessionID,
            Sessions.ExpiresDate,
            Users.UserID,
            Users.Username
        FROM Sessions
        JOIN Users
            ON Users.UserID = Sessions.UserID
        WHERE Sessions.SessionID = ?
    `);

    return statement.get(sessionId);
}

function deleteSession(sessionId) {
    const statement = db.prepare(`
        DELETE FROM Sessions
        WHERE SessionID = ?
    `);

    statement.run(sessionId);
}

module.exports = {
    createSession,
    getSession,
    deleteSession,
};
