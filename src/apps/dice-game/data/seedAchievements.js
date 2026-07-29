const db = require("../../../database/db.js");

const achievements = [
    // =========================
    // Roll Count
    // =========================

    {
        name: "First Throw",
        description: "Roll the dice once.",
        icon: "first-roll.png",
        type: "ROLL_COUNT",
        value: 1,
    },

    {
        name: "Getting Started",
        description: "Roll the dice 100 times.",
        icon: "roll-100.png",
        type: "ROLL_COUNT",
        value: 100,
    },

    {
        name: "Dedicated",
        description: "Roll the dice 1,000 times.",
        icon: "roll-1000.png",
        type: "ROLL_COUNT",
        value: 1000,
    },

    {
        name: "Addicted",
        description: "Roll the dice 10,000 times.",
        icon: "roll-10000.png",
        type: "ROLL_COUNT",
        value: 10000,
    },

    // =========================
    // High Scores
    // =========================

    {
        name: "Nice Roll",
        description: "Score at least 1,000 points.",
        icon: "score-1000.png",
        type: "HIGH_SCORE",
        value: 1000,
    },

    {
        name: "Big Roll",
        description: "Score at least 10,000 points.",
        icon: "score-10000.png",
        type: "HIGH_SCORE",
        value: 10000,
    },

    {
        name: "Legendary",
        description: "Score at least 100,000 points.",
        icon: "score-100000.png",
        type: "HIGH_SCORE",
        value: 100000,
    },

    // =========================
    // Special Rolls
    // =========================

    {
        name: "Snake Eyes",
        description: "Roll all ones.",
        icon: "snake-eyes.png",
        type: "ALL_ONES",
        value: 1,
    },

    {
        name: "Jackpot",
        description: "Roll all sixes.",
        icon: "jackpot.png",
        type: "ALL_SIXES",
        value: 1,
    },

    {
        name: "Balanced",
        description: "Roll every die value in a single roll.",
        icon: "balanced.png",
        type: "ALL_VALUES",
        value: 1,
    },

    {
        name: "Odds Are Good",
        description: "Roll only odd numbers in a single roll.",
        icon: "odds.png",
        type: "ALL_ODDS",
        value: 1,
    },

    {
        name: "Even Better",
        description: "Roll only even numbers in a single roll.",
        icon: "evens.png",
        type: "ALL_EVENS",
        value: 1,
    },

    // =========================
    // Face Count
    // =========================

    {
        name: "One With The Ones",
        description: "Roll at least 10 ones in a single roll.",
        icon: "ten-ones.png",
        type: "COUNT_FACE",
        value: {
            face: 1,
            amount: 10,
        },
    },

    {
        name: "Double Digits",
        description: "Roll at least 10 twos in a single roll.",
        icon: "ten-twos.png",
        type: "COUNT_FACE",
        value: {
            face: 2,
            amount: 10,
        },
    },

    {
        name: "Triple Threat",
        description: "Roll at least 10 threes in a single roll.",
        icon: "ten-threes.png",
        type: "COUNT_FACE",
        value: {
            face: 3,
            amount: 10,
        },
    },

    {
        name: "Four The Win",
        description: "Roll at least 10 fours in a single roll.",
        icon: "ten-fours.png",
        type: "COUNT_FACE",
        value: {
            face: 4,
            amount: 10,
        },
    },

    {
        name: "Five Alive",
        description: "Roll at least 10 fives in a single roll.",
        icon: "ten-fives.png",
        type: "COUNT_FACE",
        value: {
            face: 5,
            amount: 10,
        },
    },

    {
        name: "High Roller",
        description: "Roll at least 10 sixes in a single roll.",
        icon: "ten-sixes.png",
        type: "COUNT_FACE",
        value: {
            face: 6,
            amount: 10,
        },
    },

    // =========================
    // Inventory
    // =========================

    {
        name: "Collector",
        description: "Own 10 items.",
        icon: "collector.png",
        type: "ITEM_COUNT",
        value: 10,
    },

    {
        name: "Hoarder",
        description: "Own 50 items.",
        icon: "hoarder.png",
        type: "ITEM_COUNT",
        value: 50,
    },

    {
        name: "Fully Equipped",
        description: "Equip the maximum number of items.",
        icon: "fully-equipped.png",
        type: "MAX_EQUIPPED",
        value: 1,
    },

    // =========================
    // Item Rarity
    // =========================

    {
        name: "First Find",
        description: "Find your first generated item.",
        icon: "first-find.png",
        type: "RARITY_FOUND",
        value: "Common",
    },

    {
        name: "Getting Lucky",
        description: "Find an uncommon item.",
        icon: "uncommon-find.png",
        type: "RARITY_FOUND",
        value: "Uncommon",
    },

    {
        name: "Rare Treasure",
        description: "Find a rare item.",
        icon: "rare-find.png",
        type: "RARITY_FOUND",
        value: "Rare",
    },

    {
        name: "Epic Discovery",
        description: "Find an epic item.",
        icon: "epic-find.png",
        type: "RARITY_FOUND",
        value: "Epic",
    },

    {
        name: "Legendary Find",
        description: "Find a legendary item.",
        icon: "legendary-find.png",
        type: "RARITY_FOUND",
        value: "Legendary",
    },

    // =========================
    // Build Achievements
    // =========================

    {
        name: "Loaded Dice",
        description: "Have a single face with at least +25 weight.",
        icon: "loaded-dice.png",
        type: "FACE_WEIGHT",
        value: 25,
    },

    {
        name: "Jack of All Trades",
        description: "Have positive weight bonuses on every face.",
        icon: "jack-of-all-trades.png",
        type: "ALL_FACE_BUFFS",
        value: 1,
    },

    {
        name: "Specialist",
        description: "Have a single face with at least double weight.",
        icon: "specialist.png",
        type: "DOUBLE_FACE_WEIGHT",
        value: 1,
    },

    // =========================
    // Money
    // =========================

    {
        name: "Money",
        description: "Earn your first $0.01.",
        icon: "first-cent.png",
        type: "TOTAL_MONEY",
        value: 1,
    },

    {
        name: "First Coins",
        description: "Earn your first $1.00.",
        icon: "first-dollar.png",
        type: "TOTAL_MONEY",
        value: 100,
    },

    {
        name: "Pocket Change",
        description: "Earn $10.00 total.",
        icon: "ten-dollars.png",
        type: "TOTAL_MONEY",
        value: 1000,
    },

    {
        name: "Getting Rich",
        description: "Earn $100.00 total.",
        icon: "hundred-dollars.png",
        type: "TOTAL_MONEY",
        value: 10000,
    },

    {
        name: "Big Saver",
        description: "Earn $1,000.00 total.",
        icon: "thousand-dollars.png",
        type: "TOTAL_MONEY",
        value: 100000,
    },

    {
        name: "Money Maker",
        description: "Earn $10,000.00 total.",
        icon: "ten-thousand-dollars.png",
        type: "TOTAL_MONEY",
        value: 1000000,
    },

    {
        name: "Lucky Roll",
        description: "Earn at least $0.10 from a single roll.",
        icon: "lucky-roll.png",
        type: "ROLL_MONEY",
        value: 10,
    },

    {
        name: "Big Payday",
        description: "Earn at least $1.00 from a single roll.",
        icon: "big-payday.png",
        type: "ROLL_MONEY",
        value: 100,
    },

    {
        name: "Jackpot Roll",
        description: "Earn at least $10.00 from a single roll.",
        icon: "jackpot-money.png",
        type: "ROLL_MONEY",
        value: 1000,
    },

    {
        name: "Massive Jackpot Roll",
        description: "Earn at least $100.00 from a single roll.",
        icon: "massive-jackpot-money.png",
        type: "ROLL_MONEY",
        value: 10000,
    },
];

function seedAchievements() {
    const insert = db.prepare(`
        INSERT OR IGNORE INTO DiceGameAchievements
        (
            Name,
            Description,
            Icon,
            RequirementType,
            RequirementValue
        )
        VALUES (
            @name,
            @description,
            @icon,
            @type,
            @value
        )
    `);

    const transaction = db.transaction(() => {
        for (const achievement of achievements) {
            insert.run({
                ...achievement,
                value:
                    typeof achievement.value === "object"
                        ? JSON.stringify(achievement.value)
                        : achievement.value,
            });
        }
    });

    transaction();
}

module.exports = {
    seedAchievements,
};
