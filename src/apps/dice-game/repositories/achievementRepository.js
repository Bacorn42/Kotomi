const db = require("../../../database/db");

function getAllAchievements() {
    return db
        .prepare(
            `
            SELECT
                AchievementID,
                Name,
                Description,
                Icon,
                RequirementType,
                RequirementValue
            FROM Achievements
            `,
        )
        .all();
}

function hasAchievement(userId, achievementId) {
    const result = db
        .prepare(
            `
                SELECT 1
                FROM UserAchievements
                WHERE UserID = ?
                AND AchievementID = ?
                `,
        )
        .get(userId, achievementId);

    return !!result;
}

function unlockAchievement(userId, achievementId) {
    db.prepare(
        `
            INSERT OR IGNORE INTO UserAchievements
            (
                UserID,
                AchievementID
            )
            VALUES (?, ?)
            `,
    ).run(userId, achievementId);
}

function getUserAchievements(userId) {
    return db
        .prepare(
            `
            SELECT
                AchievementID,
                UnlockedDate
            FROM UserAchievements
            WHERE UserID = ?
            `,
        )
        .all(userId);
}

module.exports = {
    getAllAchievements,
    hasAchievement,
    unlockAchievement,
    getUserAchievements,
};
