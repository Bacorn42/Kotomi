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
            throw new Error(`Unknown effect type: ${effect.effectType}`);
    }
}

function applyDiceCount(configuration, data) {
    configuration.diceCount += data.amount;
}

function applyWeight(configuration, data) {
    const index = data.face - 1; // Index is 0-based; faces are 1-based

    if (index < 0 || index >= configuration.weights.length) {
        throw new Error(`Invalid dice face: ${data.face}`);
    }

    configuration.weights[index] = Math.max(0, configuration.weights[index] + data.amount);
}

function applyCooldown(configuration, data) {
    configuration.cooldownMs = Math.max(1000, configuration.cooldownMs + data.amount);
}

function applyScoreMultiplier(configuration, data) {
    configuration.scoreMultiplier *= data.amount;
}

function applyMoneyMultiplier(configuration, data) {
    configuration.moneyMultiplier *= data.amount;
}

function applyEffects(configuration, effects) {
    const updatedConfiguration = {
        ...configuration,
        weights: [...configuration.weights],
    };

    for (const effect of effects) {
        applyEffect(updatedConfiguration, effect);
    }

    return updatedConfiguration;
}

module.exports = {
    applyEffects,
};
