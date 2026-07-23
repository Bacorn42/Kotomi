const express = require("express");
const { rollDice } = require("../../modules/dice-game/roller");
const { calculateScore } = require("../../modules/dice-game/scoring");
const { requireLogin } = require("../middleware/auth");

const router = express.Router();

router.post("/roll", (req, res) => {
    const configuration = {
        diceCount: 10,
        weights: [60, 50, 40, 30, 20, 10],
    };

    const dice = rollDice(configuration);
    const score = calculateScore(dice);

    res.json({
        dice,
        score,
        configuration,
    });
});

module.exports = router;
