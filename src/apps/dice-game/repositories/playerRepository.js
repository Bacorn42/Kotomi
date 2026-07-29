const db = require("../../../database/db.js");

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

    const player = db
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

    return {
        userId: player.UserID,
        moneyCents: player.MoneyCents,
        diceSkin: player.DiceSkin,
        maxActiveItems: player.MaxActiveItems,
        lastRollTime: player.LastRollTime,
        createdDate: player.CreatedDate,
        updatedDate: player.UpdatedDate,
    };
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
    const settings = db
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

    return {
        maxActiveItems: settings.MaxActiveItems,
        diceSkin: settings.DiceSkin,
    };
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
