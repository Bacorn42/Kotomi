const db = require("./db.js");

const achievements = [
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
];

function seedAchievements() {
    const insert = db.prepare(`
        INSERT OR IGNORE INTO Achievements
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
            insert.run(achievement);
        }
    });

    transaction();
}

module.exports = {
    seedAchievements,
};
