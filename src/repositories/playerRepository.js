const db = require("../database/db.js");
const { getDiceConfiguration } = require("../services/diceConfiguration.js");
const { getPlayerConfiguration } = require("../services/playerConfiguration.js");

function getPlayerProfile(userId) {
    const user = db
        .prepare(
            `
            SELECT
                Username,
                CreatedDate
            FROM Users
            WHERE UserID = ?
        `,
        )
        .get(userId);

    const stats = db
        .prepare(
            `
        SELECT
            COUNT(*) AS totalRolls,
            COALESCE(SUM(Score), 0) AS totalScore,
            COALESCE(AVG(Score), 0) AS averageScore,
            COALESCE(MAX(Score), 0) AS highestScore
        FROM Rolls
        WHERE UserID = ?
    `,
        )
        .get(userId);

    const topRolls = db
        .prepare(
            `
        SELECT
            RollID,
            DiceValues,
            Score,
            CreatedDate
        FROM Rolls
        WHERE UserID = ?
        ORDER BY Score DESC
        LIMIT 10
    `,
        )
        .all(userId);

    const player = getPlayer(userId);
    const configuration = getPlayerConfiguration(getDiceConfiguration(player), userId);

    return {
        username: user.Username,
        createdDate: user.CreatedDate,

        totalRolls: stats.totalRolls,
        totalScore: stats.totalScore,
        moneyCents: player.MoneyCents,
        averageScore: Number(stats.averageScore.toFixed(2)),
        highestScore: stats.highestScore,

        diceCount: configuration.diceCount,
        weights: configuration.weights,
        topRolls: topRolls.map((roll) => ({
            rollId: roll.RollID,
            dice: JSON.parse(roll.DiceValues),
            score: roll.Score,
            createdDate: roll.CreatedDate,
        })),
    };
}

function getTotalRolls(userId) {
    const result = db
        .prepare(
            `
            SELECT COUNT(*) AS totalRolls
            FROM Rolls
            WHERE UserID = ?
            `,
        )
        .get(userId);

    return result.totalRolls;
}

function createPlayer(userId) {
    db.prepare(
        `
        INSERT INTO Players
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
            FROM Players
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
        FROM Players
        WHERE UserID = ?
        `,
        )
        .get(userId);
}

function updateLastRollTime(userId) {
    db.prepare(
        `
        UPDATE Players
        SET
            LastRollTime = CURRENT_TIMESTAMP,
            UpdatedDate = CURRENT_TIMESTAMP
        WHERE UserID = ?
        `,
    ).run(userId);
}

function addMoneyCents(userId, amount) {
    db.prepare(
        `
        UPDATE Players
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
        FROM Players
        WHERE UserID = ?
    `,
        )
        .get(userId);
}

module.exports = {
    getPlayerProfile,
    getTotalRolls,
    createPlayer,
    ensurePlayer,
    getPlayer,
    updateLastRollTime,
    addMoneyCents,
    getPlayerSettings,
};
