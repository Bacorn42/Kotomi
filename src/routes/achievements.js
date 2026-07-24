const express = require("express");

const router = express.Router();

const {
    getAllAchievements,
    getUserAchievements,
} = require("../repositories/achievementRepository.js");

const { requireLogin } = require("../middleware/auth.js");

router.get("/", requireLogin, (req, res) => {
    const userId = req.user.UserID;
    const achievements = getAllAchievements();
    const unlocked = getUserAchievements(userId);
    const unlockedIds = new Set(unlocked.map((a) => a.AchievementID));

    res.json(
        achievements.map((achievement) => ({
            id: achievement.AchievementID,
            name: achievement.Name,
            description: achievement.Description,
            icon: achievement.Icon,
            unlocked: unlockedIds.has(achievement.AchievementID),
        })),
    );
});

module.exports = router;
