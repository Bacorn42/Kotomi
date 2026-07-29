const express = require("express");
const { rollDice } = require("../core/roller.js");
const { calculateScore, calculateMoney } = require("../core/calculation.js");
const rollRepository = require("../repositories/rollRepository.js");
const playerRepository = require("../repositories/playerRepository.js");
const playerItemRepository = require("../repositories/playerItemRepository.js");
const { requireLogin } = require("../../../middleware/auth.js");
const { checkAchievements } = require("../services/achievement.js");
const { getDiceConfiguration } = require("../services/diceConfiguration.js");
const { canRoll, getRemainingCooldown } = require("../services/diceCooldown.js");
const { getPlayerConfiguration } = require("../services/playerConfiguration.js");
const itemGeneration = require("../services/itemGeneration.js");
const statisticsService = require("../services/statistics.js");
const playerProfileService = require("../services/playerProfile.js");
const diceConfig = require("../config/dice.js");
const socket = require("../../../services/socket.js");

const router = express.Router();

router.post("/roll", requireLogin, (req, res) => {
    const userId = req.user.UserID;

    const player = playerRepository.getPlayer(userId);
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
        playerRepository.addMoneyCents(userId, moneyCents);
    }

    let droppedItem = null;
    if (Math.random() < diceConfig.itemDropChance) {
        droppedItem = itemGeneration.generateItem(userId);

        socket.sendDiceFeed({
            type: "ITEM",
            username: playerRepository.getUsername(userId),
            item: droppedItem,
        });
    }

    const rollId = rollRepository.saveRoll({
        userId,
        dice,
        weights: configuration.weights,
        score,
        moneyCents,
        createdDate: new Date().toISOString(),
    });
    playerRepository.updateLastRollTime(userId);

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
        maxEquippedItems: player.maxActiveItems,
        droppedItem,
        faceWeights: configuration.weights,
        maxFaceWeight: Math.max(...configuration.weights),
        moneyCents,
        totalMoneyCents: rollRepository.getTotalMoneyCents(userId),
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
    res.json(rollRepository.getRecentRolls(req.user.UserID, 10));
});

router.get("/profile", requireLogin, (req, res) => {
    res.json(playerProfileService.getPlayerProfile(req.user.UserID));
});

router.get("/statistics", requireLogin, (req, res) => {
    res.json(statisticsService.getStatistics(req.user.UserID));
});

module.exports = router;
