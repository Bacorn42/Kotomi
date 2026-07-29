const playerItemRepository = require("../repositories/playerItemRepository.js");
const { applyEffects } = require("./diceEffects.js");

function getPlayerConfiguration(baseConfiguration, userId) {
    const configuration = {
        ...baseConfiguration,
        weights: [...baseConfiguration.weights],
    };

    const equippedItems = playerItemRepository.getEquipped(userId);
    let effects = [];

    for (const item of equippedItems) {
        const itemEffects = playerItemRepository.getItemEffects(item.PlayerItemID);

        effects.push(...itemEffects);
    }

    return applyEffects(configuration, effects);
}

module.exports = {
    getPlayerConfiguration,
};
