function scaleEffect(effectType, effectData, rarityMultiplier) {
    const scaled = {
        ...effectData,
    };

    if (scaled.amount === undefined) {
        return scaled;
    }

    switch (effectType) {
        case "score_multiplier":
        case "money_multiplier":
            scaled.amount = 1 + (scaled.amount - 1) * rarityMultiplier;
            break;
        default:
            scaled.amount = Math.round(scaled.amount * rarityMultiplier);
            break;
    }

    return scaled;
}

module.exports = {
    scaleEffect,
};
