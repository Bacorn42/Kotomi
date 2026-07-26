function calculateMoney(score, multiplier) {
    if (score < 100) {
        return 0;
    }

    return Math.round(0.0030137 * Math.pow(Math.log10(score), 8.38) * multiplier);
}

module.exports = {
    calculateMoney,
};
