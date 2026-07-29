const rarities = {
    COMMON: {
        name: "Common",
        multiplier: 1,
        chance: 0.7,
    },

    UNCOMMON: {
        name: "Uncommon",
        multiplier: 1.25,
        chance: 0.2,
    },

    RARE: {
        name: "Rare",
        multiplier: 1.5,
        chance: 0.07,
    },

    EPIC: {
        name: "Epic",
        multiplier: 2,
        chance: 0.025,
    },

    LEGENDARY: {
        name: "Legendary",
        multiplier: 3,
        chance: 0.005,
    },
};

const rarityList = [
    rarities.COMMON,
    rarities.UNCOMMON,
    rarities.RARE,
    rarities.EPIC,
    rarities.LEGENDARY,
];

module.exports = {
    ...rarities,
    list: rarityList,
};
