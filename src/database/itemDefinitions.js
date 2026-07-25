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
        name: "Ring of Fives",
        description: "A mysterious ring that favors the number five.",
        icon: "ring-of-fives.png",
        costCents: 0,
        canGenerate: true,
        effects: [
            {
                type: "weight",
                data: {
                    value: 5,
                    amount: 5,
                },
            },
            {
                type: "weight",
                data: {
                    value: 6,
                    amount: -2,
                },
            },
        ],
    },
];
