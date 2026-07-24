const {
    getAllAchievements,
    hasAchievement,
    unlockAchievement,
} = require("../repositories/achievementRepository.js");

function checkAchievements(userId, context) {
    const achievements = getAllAchievements();
    const unlocked = [];

    for (const achievement of achievements) {
        if (hasAchievement(userId, achievement.AchievementID)) {
            continue;
        }

        if (meetsRequirement(achievement, context)) {
            unlockAchievement(userId, achievement.AchievementID);
            unlocked.push(achievement);
        }
    }

    return unlocked;
}

function meetsRequirement(achievement, context) {
    switch (achievement.RequirementType) {
        case "ROLL_COUNT":
            return context.totalRolls >= achievement.RequirementValue;
        case "HIGH_SCORE":
            return context.score >= achievement.RequirementValue;
        case "ALL_ONES":
            return context.dice.every((value) => value === 1);
        case "ALL_SIXES":
            return context.dice.every((value) => value === 6);
        case "ALL_VALUES":
            return new Set(context.dice).size === 6;
        default:
            return false;
    }
}

module.exports = {
    checkAchievements,
};
