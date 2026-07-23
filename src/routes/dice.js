const express = require("express");
const { rollDice } = require("../../modules/dice-game/roller");
const { calculateScore } = require("../../modules/dice-game/scoring");
const diceRepository = require("../repositories/rollRepository");
const playerRepository = require("../repositories/playerRepository");
const { requireLogin } = require("../middleware/auth");

const router = express.Router();

router.post("/roll", requireLogin, (req, res) => {
    const userId = req.user.UserID;

    const configuration = {
        diceCount: 10,
        weights: [60, 50, 40, 30, 20, 10],
    };

    const dice = rollDice(configuration);
    const score = calculateScore(dice);

    const rollId = diceRepository.saveRoll({
        userId,
        dice,
        weights: configuration.weights,
        score,
    });

    res.json({
        rollId,
        dice,
        score,
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
