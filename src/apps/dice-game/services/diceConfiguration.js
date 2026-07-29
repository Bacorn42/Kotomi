const defaultDiceConfig = require("../config/dice.js");

function getDiceConfiguration(player) {
    return {
        diceCount: defaultDiceConfig.defaultDiceCount,
        weights: [...defaultDiceConfig.defaultWeights],
        cooldownMs: defaultDiceConfig.defaultCooldownMs,
        skin: player.diceSkin,
        maxActiveItems: player.maxActiveItems,
        scoreMultiplier: defaultDiceConfig.scoreMultiplier,
        moneyMultiplier: defaultDiceConfig.moneyMultiplier,
    };
}

module.exports = {
    getDiceConfiguration,
};
