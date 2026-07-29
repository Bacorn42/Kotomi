const db = require("../../../database/db.js");
const { getDiceConfiguration } = require("../services/diceConfiguration.js");
const { getPlayerConfiguration } = require("../services/playerConfiguration.js");

function getTotalRolls(userId) {
    const result = db
        .prepare(
            `
            SELECT COUNT(*) AS totalRolls
            FROM DiceGameRolls
            WHERE UserID = ?
            `,
        )
        .get(userId);

    return result.totalRolls;
}

function createPlayer(userId) {
    db.prepare(
        `
        INSERT INTO DiceGamePlayers
        (
            UserID
        )
        VALUES
        (?)
        `,
    ).run(userId);
}

function ensurePlayer(userId) {
    const existing = db
        .prepare(
            `
            SELECT
                UserID
            FROM DiceGamePlayers
            WHERE UserID = ?
            `,
        )
        .get(userId);

    if (!existing) {
        createPlayer(userId);
    }
}

function getPlayer(userId) {
    ensurePlayer(userId);

    return db
        .prepare(
            `
        SELECT
            UserID,
            MoneyCents,
            DiceSkin,
            MaxActiveItems,
            LastRollTime,
            CreatedDate,
            UpdatedDate
        FROM DiceGamePlayers
        WHERE UserID = ?
        `,
        )
        .get(userId);
}

function updateLastRollTime(userId) {
    db.prepare(
        `
        UPDATE DiceGamePlayers
        SET
            LastRollTime = CURRENT_TIMESTAMP,
            UpdatedDate = CURRENT_TIMESTAMP
        WHERE UserID = ?
        `,
    ).run(userId);
}

function getMoneyCents(userId) {
    return db
        .prepare(
            `
        SELECT MoneyCents
        FROM DiceGamePlayers
        WHERE UserID = ?
    `,
        )
        .get(userId).MoneyCents;
}

function addMoneyCents(userId, amount) {
    db.prepare(
        `
        UPDATE DiceGamePlayers
        SET
            MoneyCents = MoneyCents + ?,
            UpdatedDate = CURRENT_TIMESTAMP
        WHERE UserID = ?
        `,
    ).run(amount, userId);
}

function getPlayerSettings(userId) {
    return db
        .prepare(
            `
        SELECT
            MaxActiveItems,
            DiceSkin
        FROM DiceGamePlayers
        WHERE UserID = ?
    `,
        )
        .get(userId);
}

function getUsername(userId) {
    return db
        .prepare(
            `
            SELECT Username
            FROM Users
            WHERE UserID = ?
        `,
        )
        .get(userId).Username;
}

module.exports = {
    getTotalRolls,
    createPlayer,
    ensurePlayer,
    getPlayer,
    updateLastRollTime,
    getMoneyCents,
    addMoneyCents,
    getPlayerSettings,
    getUsername,
};
