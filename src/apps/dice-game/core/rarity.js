const rarities = require("../constants/rarities.js");

function getRandomRarity() {
    const roll = Math.random();

    for (const rarity of rarities.list) {
        total += rarity.chance;

        if (roll < total) {
            return rarity;
        }
    }

    return rarities.LEGENDARY;
}

module.exports = {
    getRandomRarity,
};
