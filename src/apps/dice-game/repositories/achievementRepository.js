const db = require("../../../database/db");

function parseRequirementValue(value) {
    if (typeof value !== "string") {
        return value;
    }

    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
}

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
            FROM DiceGameAchievements
            `,
        )
        .all()
        .map((achievement) => ({
            id: achievement.AchievementID,
            name: achievement.Name,
            description: achievement.Description,
            icon: achievement.Icon,
            requirementType: achievement.RequirementType,
            requirementValue: parseRequirementValue(achievement.RequirementValue),
        }));
}

function hasAchievement(userId, achievementId) {
    const result = db
        .prepare(
            `
                SELECT 1
                FROM DiceGameUserAchievements
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
            INSERT OR IGNORE INTO DiceGameUserAchievements
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
            FROM DiceGameUserAchievements
            WHERE UserID = ?
            `,
        )
        .all(userId)
        .map((achievement) => ({
            achievementId: achievement.AchievementID,
            unlockedDate: achievement.UnlockedDate,
        }));
}

module.exports = {
    getAllAchievements,
    hasAchievement,
    unlockAchievement,
    getUserAchievements,
};
