const diceConfig = require("../config/dice.js");

function getDiceConfiguration(player) {
    return {
        diceCount: diceConfig.defaultDiceCount,
        weights: [...diceConfig.defaultWeights],
        cooldownMs: diceConfig.defaultCooldownMs,
        skin: player.DiceSkin,
        maxActiveItems: player.MaxActiveItems,
    };
}

module.exports = {
    getDiceConfiguration,
};
