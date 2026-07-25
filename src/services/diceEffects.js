function applyEffect(configuration, effect) {
    switch (effect.effectType) {
        case "dice_count":
            applyDiceCount(configuration, effect.effectData);
            break;
        case "weight":
            applyWeight(configuration, effect.effectData);
            break;
        case "cooldown":
            applyCooldown(configuration, effect.effectData);
            break;
        case "score_multiplier":
            applyScoreMultiplier(configuration, effect.effectData);
            break;
        case "money_multiplier":
            applyMoneyMultiplier(configuration, effect.effectData);
            break;
        default:
            console.warn("Unknown effect type:", effect.effectType);
    }
}

function applyDiceCount(configuration, data) {
    configuration.diceCount += data.amount;
}

function applyWeight(configuration, data) {
    const index = data.face - 1; // Index is 0-based; faces are 1-based

    if (index < 0 || index >= configuration.weights.length) {
        return;
    }

    configuration.weights[index] += data.amount;
}

function applyCooldown(configuration, data) {
    configuration.cooldownMs += data.amount;
}

function applyScoreMultiplier(configuration, data) {
    configuration.scoreMultiplier *= data.amount;
}

function applyMoneyMultiplier(configuration, data) {
    configuration.moneyMultiplier *= data.amount;
}

function applyEffects(configuration, effects) {
    for (const effect of effects) {
        applyEffect(configuration, effect);
    }

    return configuration;
}

module.exports = {
    applyEffects,
};
