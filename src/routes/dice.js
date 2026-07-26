const express = require("express");
const { rollDice } = require("../../modules/dice-game/roller");
const { calculateScore } = require("../../modules/dice-game/scoring");
const diceRepository = require("../repositories/rollRepository");
const playerRepository = require("../repositories/playerRepository");
const playerItemRepository = require("../repositories/playerItemRepository.js");
const { requireLogin } = require("../middleware/auth");
const { checkAchievements } = require("../services/achievement.js");
const { getPlayer } = require("../repositories/playerRepository.js");
const { getDiceConfiguration } = require("../services/diceConfiguration.js");
const { updateLastRollTime, addMoneyCents } = require("../repositories/playerRepository.js");
const { canRoll, getRemainingCooldown } = require("../services/diceCooldown.js");
const { calculateMoney } = require("../services/rewards.js");
const { getPlayerConfiguration } = require("../services/playerConfiguration.js");
const itemGeneration = require("../services/itemGeneration.js");
const statisticsService = require("../services/statistics.js");
const socket = require("../services/socket");

const router = express.Router();

router.post("/roll", requireLogin, (req, res) => {
    const userId = req.user.UserID;

    const player = getPlayer(userId);
    const configuration = getPlayerConfiguration(getDiceConfiguration(player), userId);

    if (!canRoll(player, configuration.cooldownMs)) {
        return res.status(429).json({
            error: "Roll cooldown active",
            remainingMs: getRemainingCooldown(player, configuration.cooldownMs),
        });
    }

    const dice = rollDice(configuration);
    const score = calculateScore(dice, configuration.scoreMultiplier);
    const moneyCents = calculateMoney(score, configuration.moneyMultiplier);
    if (moneyCents > 0) {
        addMoneyCents(userId, moneyCents);
    }

    let droppedItem = null;
    if (Math.random() < 0.01) {
        droppedItem = itemGeneration.generateItem(userId);

        socket.sendDiceFeed({
            type: "ITEM",
            username: playerRepository.getUsername(userId),
            item: droppedItem,
        });
    }

    const rollId = diceRepository.saveRoll({
        userId,
        dice,
        weights: configuration.weights,
        score,
        moneyCents,
    });
    updateLastRollTime(userId);

    socket.sendDiceFeed({
        type: "ROLL",
        username: req.user.Username,
        score,
        moneyCents,
        diceCount: configuration.diceCount,
    });

    const unlocked = checkAchievements(userId, {
        score,
        dice,
        totalRolls: playerRepository.getTotalRolls(userId),
        itemCount: playerItemRepository.getItemCount(userId),
        equippedItemCount: playerItemRepository.getEquippedCount(userId),
        maxEquippedItems: player.MaxActiveItems,
        droppedItem,
        faceWeights: configuration.weights,
        maxFaceWeight: Math.max(...configuration.weights),
        moneyCents,
        totalMoneyCents: diceRepository.getTotalMoneyCents(userId),
    });

    for (const achievement of unlocked) {
        socket.sendDiceFeed({
            type: "ACHIEVEMENT",
            username: playerRepository.getUsername(userId),
            achievement,
        });
    }

    res.json({
        rollId,
        dice,
        score,
        moneyCents,
        droppedItem,
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

    const player = getPlayer(req.user.UserID);
    const configuration = getPlayerConfiguration(getDiceConfiguration(player), req.user.UserID);

    stats.cooldownMs = configuration.cooldownMs;

    res.json(stats);
});

router.get("/statistics", requireLogin, (req, res) => {
    res.json(statisticsService.getStatistics(req.user.UserID));
});

module.exports = router;
