const express = require("express");
const { rollDice } = require("../../modules/dice-game/roller");
const { calculateScore } = require("../../modules/dice-game/scoring");
const diceRepository = require("../repositories/rollRepository");
const playerRepository = require("../repositories/playerRepository");
const { requireLogin } = require("../middleware/auth");
const { checkAchievements } = require("../services/achievement.js");
const { getPlayer } = require("../repositories/playerRepository.js");
const { getDiceConfiguration } = require("../services/diceConfiguration.js");
const { updateLastRollTime } = require("../repositories/playerRepository.js");
const { canRoll, getRemainingCooldown } = require("../services/diceCooldown.js");

const router = express.Router();

router.post("/roll", requireLogin, (req, res) => {
    const userId = req.user.UserID;

    const player = getPlayer(userId);
    const configuration = getDiceConfiguration(player);

    if (!canRoll(player, configuration.cooldownMs)) {
        return res.status(429).json({
            error: "Roll cooldown active",
            remainingMs: getRemainingCooldown(player, configuration.cooldownMs),
        });
    }

    const dice = rollDice(configuration);
    const score = calculateScore(dice);

    const rollId = diceRepository.saveRoll({
        userId,
        dice,
        weights: configuration.weights,
        score,
    });
    updateLastRollTime(userId);

    const unlocked = checkAchievements(userId, {
        score,
        dice,
        totalRolls: playerRepository.getTotalRolls(userId),
    });

    res.json({
        rollId,
        dice,
        score,
        unlockedAchievements: unlocked,
        configuration,
    });
});

router.get("/recent", requireLogin, (req, res) => {
    const rolls = diceRepository.getRecentRolls(req.user.UserID, 10);

    const formattedRolls = rolls.map((roll) => ({
        rollId: roll.RollID,
        dice: JSON.parse(roll.DiceValues),
        score: roll.Score,
        createdDate: roll.CreatedDate,
    }));

    res.json(formattedRolls);
});

router.get("/profile", requireLogin, (req, res) => {
    const stats = playerRepository.getPlayerProfile(req.user.UserID);

    res.json(stats);
});

module.exports = router;
