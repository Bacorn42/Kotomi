const db = require("../../../database/db");

function saveRoll(roll) {
    const statement = db.prepare(`
        INSERT INTO Rolls
        (
            UserID,
            DiceValues,
            DiceCount,
            Weights,
            Score,
            MoneyCents,
            CreatedDate
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = statement.run(
        roll.userId,
        JSON.stringify(roll.dice),
        roll.dice.length,
        JSON.stringify(roll.weights),
        roll.score,
        roll.moneyCents,
        roll.createdDate,
    );

    return result.lastInsertRowid;
}

function getRecentRolls(userId, limit = 10) {
    const statement = db.prepare(`
        SELECT *
        FROM Rolls
        WHERE UserID = ?
        ORDER BY CreatedDate DESC
        LIMIT ?
    `);

    return statement.all(userId, limit);
}

function getUserTopRolls(userId) {
    return db
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
}

function getTotalMoneyCents(userId) {
    const statement = db.prepare(
        `
        SELECT SUM(MoneyCents) AS TotalMoneyCents
        FROM Rolls
        WHERE UserID = ?
        `,
    );

    return statement.get(userId).TotalMoneyCents ?? 0;
}

function getUserStats(userId) {
    return db
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
}

module.exports = {
    saveRoll,
    getRecentRolls,
    getUserTopRolls,
    getTotalMoneyCents,
    getUserStats,
};
