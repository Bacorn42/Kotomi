const playerItemRepository = require("../repositories/playerItemRepository.js");
const { applyEffects } = require("./diceEffects.js");

function getPlayerConfiguration(baseConfiguration, userId) {
    if (!baseConfiguration) {
        throw new Error("Base configuration is required.");
    }

    const configuration = {
        ...baseConfiguration,
        weights: [...baseConfiguration.weights],
    };

    const equippedItems = playerItemRepository.getEquipped(userId);
    const effects = equippedItems.flatMap((item) =>
        playerItemRepository.getItemEffects(item.PlayerItemID),
    );

    return applyEffects(configuration, effects);
}

module.exports = {
    getPlayerConfiguration,
};
