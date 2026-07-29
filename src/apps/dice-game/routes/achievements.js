const express = require("express");

const router = express.Router();

const {
    getAllAchievements,
    getUserAchievements,
} = require("../repositories/achievementRepository.js");
const { getPlayerProfile } = require("../services/playerProfileService.js");

const { requireLogin } = require("../../../middleware/auth.js");

router.get("/", requireLogin, (req, res) => {
    const userId = req.user.UserID;
    const achievements = getAllAchievements();
    const unlocked = getUserAchievements(userId);
    const stats = getPlayerProfile(userId);
    const unlockedMap = new Map(unlocked.map((a) => [a.AchievementID, a]));

    res.json({
        achievements: achievements.map((achievement) => {
            const unlockedAchievement = unlockedMap.get(achievement.AchievementID);

            return {
                id: achievement.AchievementID,
                name: achievement.Name,
                description: achievement.Description,
                icon: achievement.Icon,
                requirementType: achievement.RequirementType,
                requirementValue: achievement.RequirementValue,
                unlocked: !!unlockedAchievement,
                unlockedDate: unlockedAchievement?.UnlockedDate ?? null,
            };
        }),

        stats: {
            totalRolls: stats.totalRolls,
            totalScore: stats.totalScore,
            highestScore: stats.highestScore,
        },
    });
});

module.exports = router;
