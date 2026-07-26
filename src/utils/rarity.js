const rarities = require("../constants/rarities.js");

function getRandomRarity() {
    const roll = Math.random();

    if (roll < 0.7) {
        return rarities.COMMON;
    }

    if (roll < 0.9) {
        return rarities.UNCOMMON;
    }

    if (roll < 0.97) {
        return rarities.RARE;
    }

    if (roll < 0.995) {
        return rarities.EPIC;
    }

    return rarities.LEGENDARY;
}

module.exports = {
    getRandomRarity,
};
