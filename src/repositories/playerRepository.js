const db = require("../database/db.js");

function getPlayerStats(userId) {
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

    return {
        totalRolls: stats.totalRolls,
        totalScore: stats.totalScore,
        averageScore: Number(stats.averageScore.toFixed(2)),
        highestScore: stats.highestScore,
        topRolls: topRolls.map((roll) => ({
            rollId: roll.RollID,
            dice: JSON.parse(roll.DiceValues),
            score: roll.Score,
            createdDate: roll.CreatedDate,
        })),
    };
}

module.exports = {
    getPlayerStats,
};
