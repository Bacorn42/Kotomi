function rollWeightedDie(weights) {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

    if (totalWeight <= 0) {
        throw new Error("Invalid dice weights");
    }

    let random = Math.random() * totalWeight;

    for (let i = 0; i < weights.length; i++) {
        random -= weights[i];
        if (random < 0) {
            return i + 1;
        }
    }

    return weights.length;
}

function rollDice(configuration) {
    const { diceCount, weights } = configuration;
    const dice = [];

    for (let i = 0; i < diceCount; i++) {
        dice.push(rollWeightedDie(weights));
    }

    return dice;
}

module.exports = {
    rollDice,
};
