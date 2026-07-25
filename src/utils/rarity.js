const rarities = require("../constants/rarities.js");

function getRandomRarity() {
    const roll = Math.random();

    if (roll < 0.6) {
        return rarities.COMMON;
    }

    if (roll < 0.85) {
        return rarities.UNCOMMON;
    }

    if (roll < 0.95) {
        return rarities.RARE;
    }

    if (roll < 0.99) {
        return rarities.EPIC;
    }

    return rarities.LEGENDARY;
}

module.exports = {
    getRandomRarity,
};
