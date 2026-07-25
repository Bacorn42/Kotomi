module.exports = [
    {
        name: "Lucky Fours",
        description: "+5 weight to 4s.",
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
        description: "+5 weight to 5s.",
        icon: "lucky-fives.png",
        costCents: 15,
        canGenerate: false,
        effects: [
            {
                type: "weight",
                data: {
                    face: 5,
                    amount: 5,
                },
            },
        ],
    },

    {
        name: "Heavy Sixes",
        description: "+5 weight to 6s.",
        icon: "heavy-sixes.png",
        costCents: 20,
        canGenerate: false,
        effects: [
            {
                type: "weight",
                data: {
                    face: 6,
                    amount: 5,
                },
            },
        ],
    },

    {
        name: "Extra Die",
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
];
