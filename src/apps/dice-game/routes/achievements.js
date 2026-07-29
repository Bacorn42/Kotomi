const express = require("express");

const router = express.Router();

const achievementRepository = require("../repositories/achievementRepository.js");
const rollRepository = require("../repositories/rollRepository.js");

const { requireLogin } = require("../../../middleware/auth.js");

router.get("/", requireLogin, (req, res) => {
    const userId = req.user.UserID;

    const achievements = achievementRepository.getAllAchievements();
    const unlocked = achievementRepository.getUserAchievements(userId);
    const stats = rollRepository.getUserStats(userId);

    const unlockedMap = new Map(unlocked.map((a) => [a.achievementId, a]));

    res.json({
        achievements: achievements.map((achievement) => {
            const unlockedAchievement = unlockedMap.get(achievement.id);

            return {
                ...achievement,
                unlocked: !!unlockedAchievement,
                unlockedDate: unlockedAchievement?.unlockedDate ?? null,
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
