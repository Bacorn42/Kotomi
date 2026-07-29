const {
    getAllAchievements,
    hasAchievement,
    unlockAchievement,
} = require("../repositories/achievementRepository.js");
const diceConfig = require("../config/dice.js");

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
    const value = parseRequirementValue(achievement.RequirementValue);
    const weightBonuses = context.faceWeights.map(
        (weight, index) => weight - diceConfig.defaultWeights[index],
    );

    switch (achievement.RequirementType) {
        case "ROLL_COUNT":
            return context.totalRolls >= value;
        case "HIGH_SCORE":
            return context.score >= value;
        case "ALL_ONES":
            return context.dice.every((value) => value === 1);
        case "ALL_SIXES":
            return context.dice.every((value) => value === 6);
        case "ALL_VALUES":
            return new Set(context.dice).size === diceConfig.defaultWeights.length;
        case "ALL_ODDS":
            return context.dice.every((value) => value % 2 === 1);
        case "ALL_EVENS":
            return context.dice.every((value) => value % 2 === 0);
        case "COUNT_FACE":
            return context.dice.filter((face) => face === value.face).length >= value.amount;
        case "ITEM_COUNT":
            return context.itemCount >= value;
        case "MAX_EQUIPPED":
            return context.equippedItemCount >= context.maxEquippedItems;
        case "RARITY_FOUND":
            return context.droppedItem?.rarity === value;
        case "FACE_WEIGHT":
            return Math.max(...weightBonuses) >= value;
        case "ALL_FACE_BUFFS":
            return weightBonuses.every((bonus) => bonus > 0);
        case "DOUBLE_FACE_WEIGHT":
            return weightBonuses.some(
                (bonus, index) =>
                    diceConfig.defaultWeights[index] + bonus >=
                    diceConfig.defaultWeights[index] * 2,
            );
        case "TOTAL_MONEY":
            return context.totalMoneyCents >= value;
        case "ROLL_MONEY":
            return context.moneyCents >= value;
        default:
            return false;
    }
}

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

module.exports = {
    checkAchievements,
};
