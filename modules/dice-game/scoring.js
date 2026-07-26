function calculateScore(dice, multiplier) {
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

    return Math.round(score * multiplier);
}

module.exports = {
    calculateScore,
};
