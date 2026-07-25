function scaleEffect(effectData, multiplier) {
    const scaled = {
        ...effectData,
    };

    if (scaled.amount !== undefined) {
        scaled.amount = Math.round(scaled.amount * multiplier);
    }

    return scaled;
}

module.exports = {
    scaleEffect,
};
