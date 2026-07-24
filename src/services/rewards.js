function calculateMoney(score) {
    if (score < 100) {
        return 0;
    }

    return Math.floor(0.0030137 * Math.pow(Math.log10(score), 8.38));
}

module.exports = {
    calculateMoney,
};
