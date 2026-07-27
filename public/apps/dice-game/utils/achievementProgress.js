export function getAchievementProgress(achievement, stats) {
    let current = 0;

    switch (achievement.requirementType) {
        case "ROLL_COUNT":
            current = stats.totalRolls;
            break;

        case "TOTAL_SCORE":
            current = stats.totalScore;
            break;

        case "HIGH_SCORE":
            current = stats.highestScore;
            break;
    }

    return {
        current: Math.min(current, achievement.requirementValue),
        target: achievement.requirementValue,
        percent: Math.min(100, (current / achievement.requirementValue) * 100),
    };
}
