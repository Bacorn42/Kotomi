function calculateScore(dice, scoreMultiplier) {
    const counts = {};

    for (const value of dice) {
        counts[value] = (counts[value] || 0) + 1;
    }

    let score = 0;

    for (const [valueString, count] of Object.entries(counts)) {
        const value = Number(valueString);

        if (value === 1) {
            score += count;
        } else {
            score += Math.pow(value, count);
        }
    }

    return Math.round(score * scoreMultiplier);
}

function calculateMoney(score, moneyMultiplier) {
    if (score < 100) {
        return 0;
    }

    return Math.round(0.0030137 * Math.pow(Math.log10(score), 8.38) * moneyMultiplier);
}

module.exports = {
    calculateScore,
    calculateMoney,
};
