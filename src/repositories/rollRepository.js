const db = require("../database/db");

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
        new Date().toISOString(),
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

module.exports = {
    saveRoll,
    getRecentRolls,
    getTotalMoneyCents,
};
