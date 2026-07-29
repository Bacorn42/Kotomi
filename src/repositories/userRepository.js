const db = require("../database/db");

function createUser(username, passwordHash) {
    const statement = db.prepare(`
        INSERT INTO Users
        (
            Username,
            PasswordHash
        )
        VALUES (?, ?)
    `);

    const result = statement.run(username, passwordHash);

    return getById(result.lastInsertRowid);
}

function getByUsername(username) {
    const statement = db.prepare(`
        SELECT *
        FROM Users
        WHERE Username = ?
    `);

    return statement.get(username);
}

function getById(userId) {
    const user = db
        .prepare(
            `
        SELECT
            UserID,
            Username,
            CreatedDate
        FROM Users
        WHERE UserID = ?
    `,
        )
        .get(userId);

    return {
        userId: user.UserID,
        username: user.Username,
        createdDate: user.CreatedDate,
    };
}

module.exports = {
    createUser,
    getByUsername,
    getById,
};
