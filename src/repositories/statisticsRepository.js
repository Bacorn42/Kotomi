const db = require("../database/db.js");

function getGlobalStats() {
    return db
        .prepare(
            `
        SELECT
            COUNT(*) AS TotalRolls,
            COALESCE(SUM(Score), 0) AS TotalScore,
            COALESCE(SUM(MoneyCents), 0) AS TotalMoneyCents,
            AVG(Score) AS AverageScore,
            AVG(MoneyCents) AS AverageMoneyCents,
            MAX(Score) AS HighestScore
        FROM Rolls
    `,
        )
        .get();
}

function getGlobalItemStats() {
    return db
        .prepare(
            `
        SELECT
            COUNT(*) AS TotalItems,
            COALESCE(SUM(Rarity = 'Common'), 0) AS CommonItems,
            COALESCE(SUM(Rarity = 'Uncommon'), 0) AS UncommonItems,
            COALESCE(SUM(Rarity = 'Rare'), 0) AS RareItems,
            COALESCE(SUM(Rarity = 'Epic'), 0) AS EpicItems,
            COALESCE(SUM(Rarity = 'Legendary'), 0) AS LegendaryItems
        FROM PlayerItems
        WHERE Rarity IS NOT NULL
    `,
        )
        .get();
}

function getGlobalPlayerStats() {
    return db
        .prepare(
            `
        SELECT COUNT(*) AS RegisteredPlayers
        FROM Users
    `,
        )
        .get();
}

function getGlobalAchievementStats() {
    return db
        .prepare(
            `
        SELECT COUNT(*) AS TotalUnlockedAchievements
        FROM PlayerAchievements
    `,
        )
        .get();
}

function getPlayerStats(userId) {
    return db
        .prepare(
            `
        SELECT
            COUNT(*) AS TotalRolls,
            COALESCE(SUM(Score), 0) AS TotalScore,
            COALESCE(SUM(MoneyCents), 0) AS TotalMoneyCents,
            AVG(Score) AS AverageScore,
            AVG(MoneyCents) AS AverageMoneyCents,
            MAX(Score) AS HighestScore
        FROM Rolls
        WHERE UserID = ?
    `,
        )
        .get(userId);
}

function getPlayerInventoryStats(userId) {
    return db
        .prepare(
            `
        SELECT
            COUNT(*) AS TotalItems,
            COALESCE(SUM(IsEquipped = 1), 0) AS EquippedItems
        FROM PlayerItems
        WHERE UserID = ?
    `,
        )
        .get(userId);
}

function getPlayerAchievementStats(userId) {
    return db
        .prepare(
            `
        SELECT COUNT(*) AS UnlockedAchievements
        FROM PlayerAchievements
        WHERE UserID = ?
    `,
        )
        .get(userId);
}

function getHighestScoreLeaderboard() {
    return db
        .prepare(
            `
        SELECT
            Users.Username,
            MAX(Rolls.Score) AS Score
        FROM Rolls
        JOIN Users
            ON Users.UserID = Rolls.UserID
        GROUP BY Users.UserID
        ORDER BY Score DESC
        LIMIT 10
    `,
        )
        .all();
}

function getMoneyLeaderboard() {
    return db
        .prepare(
            `
        SELECT
            Users.Username,
            COALESCE(SUM(Rolls.MoneyCents), 0) AS TotalMoneyCents
        FROM Users
        JOIN Rolls
            ON Users.UserID = Rolls.UserID
        GROUP BY Users.UserID
        ORDER BY TotalMoneyCents DESC
        LIMIT 10
    `,
        )
        .all();
}

function getRollLeaderboard() {
    return db
        .prepare(
            `
        SELECT
            Users.Username,
            COUNT(Rolls.RollID) AS TotalRolls
        FROM Users
        JOIN Rolls
            ON Users.UserID = Rolls.UserID
        GROUP BY Users.UserID
        ORDER BY TotalRolls DESC
        LIMIT 10
    `,
        )
        .all();
}

function getAchievementLeaderboard() {
    return db
        .prepare(
            `
        SELECT
            Users.Username,
            COUNT(*) AS Achievements
        FROM PlayerAchievements
        JOIN Users
            ON Users.UserID = PlayerAchievements.UserID
        GROUP BY Users.UserID
        ORDER BY Achievements DESC
        LIMIT 10
    `,
        )
        .all();
}

module.exports = {
    getGlobalStats,
    getGlobalItemStats,
    getGlobalPlayerStats,
    getGlobalAchievementStats,
    getPlayerStats,
    getPlayerInventoryStats,
    getPlayerAchievementStats,
    getHighestScoreLeaderboard,
    getMoneyLeaderboard,
    getRollLeaderboard,
    getAchievementLeaderboard,
};
