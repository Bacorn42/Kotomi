const db = require("../../../database/db.js");

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
        FROM DiceGameRolls
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
        FROM DiceGamePlayerItems
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
        FROM DiceGameUserAchievements
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
            COALESCE(AVG(Score), 0) AS AverageScore,
            COALESCE(AVG(MoneyCents), 0) AS AverageMoneyCents,
            COALESCE(MAX(Score), 0) AS HighestScore
        FROM DiceGameRolls
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
        FROM DiceGamePlayerItems
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
        FROM DiceGameUserAchievements
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
            MAX(DiceGameRolls.Score) AS Score
        FROM DiceGameRolls
        JOIN Users
            ON Users.UserID = DiceGameRolls.UserID
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
            COALESCE(SUM(DiceGameRolls.MoneyCents), 0) AS TotalMoneyCents
        FROM Users
        JOIN DiceGameRolls
            ON Users.UserID = DiceGameRolls.UserID
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
            COUNT(DiceGameRolls.RollID) AS TotalRolls
        FROM Users
        JOIN DiceGameRolls
            ON Users.UserID = DiceGameRolls.UserID
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
        FROM DiceGameUserAchievements
        JOIN Users
            ON Users.UserID = DiceGameUserAchievements.UserID
        GROUP BY Users.UserID
        ORDER BY Achievements DESC
        LIMIT 10
    `,
        )
        .all();
}

function getGlobalStatistics() {
    return {
        ...getGlobalStats(),
        ...getGlobalItemStats(),
        ...getGlobalPlayerStats(),
        ...getGlobalAchievementStats(),
    };
}

function getPlayerStatistics(userId) {
    return {
        ...getPlayerStats(userId),
        ...getPlayerInventoryStats(userId),
        ...getPlayerAchievementStats(userId),
    };
}

module.exports = {
    getHighestScoreLeaderboard,
    getMoneyLeaderboard,
    getRollLeaderboard,
    getAchievementLeaderboard,
    getGlobalStatistics,
    getPlayerStatistics,
};
