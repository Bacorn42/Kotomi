module.exports = [
    {
        name: "Lucky Fours",
        description: "Increases the chance of rolling 4s.",
        icon: "lucky-fours.png",
        costCents: 10,
        canGenerate: false,

        effects: [
            {
                type: "weight",
                data: {
                    face: 4,
                    amount: 5,
                },
            },
        ],
    },

    {
        name: "Lucky Fives",
        description: "Increases the chance of rolling 5s.",
        icon: "lucky-fives.png",
        costCents: 15,
        canGenerate: false,

        effects: [
            {
                type: "weight",
                data: {
                    face: 5,
                    amount: 3,
                },
            },
        ],
    },

    {
        name: "Heavy Sixes",
        description: "Makes the highest face more common.",
        icon: "heavy-sixes.png",
        costCents: 20,
        canGenerate: false,

        effects: [
            {
                type: "weight",
                data: {
                    face: 6,
                    amount: 2,
                },
            },
        ],
    },

    {
        name: "Extra Die I",
        description: "Roll one additional die.",
        icon: "extra-die.png",
        costCents: 25,
        canGenerate: false,

        effects: [
            {
                type: "dice_count",
                data: {
                    amount: 1,
                },
            },
        ],
    },

    {
        name: "Extra Die II",
        description: "Roll one additional die.",
        icon: "extra-die.png",
        costCents: 250,
        canGenerate: false,

        effects: [
            {
                type: "dice_count",
                data: {
                    amount: 1,
                },
            },
        ],
    },

    {
        name: "Extra Die III",
        description: "Roll one additional die.",
        icon: "extra-die.png",
        costCents: 1500,
        canGenerate: false,

        effects: [
            {
                type: "dice_count",
                data: {
                    amount: 1,
                },
            },
        ],
    },

    {
        name: "Swift Hands I",
        description: "Roll dice more frequently.",
        icon: "swift-hands.png",
        costCents: 30,
        canGenerate: false,

        effects: [
            {
                type: "cooldown",
                data: {
                    amount: -500,
                },
            },
        ],
    },

    {
        name: "Swift Hands II",
        description: "Roll dice more frequently.",
        icon: "swift-hands.png",
        costCents: 200,
        canGenerate: false,

        effects: [
            {
                type: "cooldown",
                data: {
                    amount: -500,
                },
            },
        ],
    },

    {
        name: "Ring of Fours",
        description: "Focuses your dice toward 4s at the cost of 6s.",
        icon: "ring-of-fours.png",
        costCents: 75,
        canGenerate: false,

        effects: [
            {
                type: "weight",
                data: {
                    face: 4,
                    amount: 8,
                },
            },

            {
                type: "weight",
                data: {
                    face: 6,
                    amount: -3,
                },
            },
        ],
    },

    {
        name: "Lucky Threes",
        description: "Increases the chance of rolling 3s.",
        icon: "lucky-threes.png",
        costCents: 8,
        canGenerate: false,

        effects: [
            {
                type: "weight",
                data: {
                    face: 3,
                    amount: 6,
                },
            },
        ],
    },

    {
        name: "Swift Hands III",
        description: "Roll dice more frequently.",
        icon: "swift-hands.png",
        costCents: 1500,
        canGenerate: false,

        effects: [
            {
                type: "cooldown",
                data: {
                    amount: -500,
                },
            },
        ],
    },

    {
        name: "Coin Purse",
        description: "Earn 10% more money from rolls.",
        icon: "coin-purse.png",
        costCents: 3500,
        canGenerate: false,

        effects: [
            {
                type: "money_multiplier",
                data: {
                    amount: 1.1,
                },
            },
        ],
    },

    {
        name: "Lucky Coin",
        description: "Earn 20% more money from rolls.",
        icon: "lucky-coin.png",
        costCents: 12000,
        canGenerate: false,

        effects: [
            {
                type: "money_multiplier",
                data: {
                    amount: 1.2,
                },
            },
        ],
    },

    {
        name: "Ring of Fives",
        description: "A mysterious ring that favors the number five.",
        icon: "ring-of-fives.png",
        costCents: 0,
        canGenerate: true,
        effects: [
            {
                type: "weight",
                data: {
                    face: 5,
                    amount: 5,
                },
            },
            {
                type: "weight",
                data: {
                    face: 6,
                    amount: -2,
                },
            },
        ],
    },

    {
        name: "Ring of Odds",
        description: "Favors odd-numbered faces.",
        icon: "ring-of-odds.png",
        costCents: 0,
        canGenerate: true,

        effects: [
            {
                type: "weight",
                data: {
                    face: 1,
                    amount: 3,
                },
            },
            {
                type: "weight",
                data: {
                    face: 3,
                    amount: 3,
                },
            },
            {
                type: "weight",
                data: {
                    face: 5,
                    amount: 3,
                },
            },
        ],
    },

    {
        name: "Ring of Evens",
        description: "Favors even-numbered faces.",
        icon: "ring-of-evens.png",
        costCents: 0,
        canGenerate: true,

        effects: [
            {
                type: "weight",
                data: {
                    face: 2,
                    amount: 3,
                },
            },
            {
                type: "weight",
                data: {
                    face: 4,
                    amount: 3,
                },
            },
            {
                type: "weight",
                data: {
                    face: 6,
                    amount: 3,
                },
            },
        ],
    },

    {
        name: "Cracked Die",
        description: "Roll more dice, but each roll scores less.",
        icon: "cracked-die.png",
        costCents: 0,
        canGenerate: true,

        effects: [
            {
                type: "dice_count",
                data: {
                    amount: 1,
                },
            },
            {
                type: "score_multiplier",
                data: {
                    amount: 0.9,
                },
            },
        ],
    },

    {
        name: "Merchant's Charm",
        description: "Earn more money, but roll more slowly.",
        icon: "merchant-charm.png",
        costCents: 0,
        canGenerate: true,

        effects: [
            {
                type: "money_multiplier",
                data: {
                    amount: 1.1,
                },
            },
            {
                type: "cooldown",
                data: {
                    amount: 500,
                },
            },
        ],
    },

    {
        name: "Rusty Horseshoe",
        description: "Increases the chance of rolling low numbers.",
        icon: "rusty-horseshoe.png",
        costCents: 0,
        canGenerate: true,

        effects: [
            {
                type: "weight",
                data: {
                    face: 1,
                    amount: 4,
                },
            },
            {
                type: "weight",
                data: {
                    face: 2,
                    amount: 4,
                },
            },
        ],
    },

    {
        name: "Heavy Fours",
        description: "Greatly favors rolling fours.",
        icon: "heavy-fours.png",
        costCents: 0,
        canGenerate: true,

        effects: [
            {
                type: "weight",
                data: {
                    face: 4,
                    amount: 8,
                },
            },
            {
                type: "weight",
                data: {
                    face: 1,
                    amount: -2,
                },
            },
        ],
    },
];
