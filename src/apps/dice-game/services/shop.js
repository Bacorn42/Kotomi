const playerRepository = require("../repositories/playerRepository.js");
const playerItemRepository = require("../repositories/playerItemRepository.js");
const itemDefinitionRepository = require("../repositories/itemDefinitionRepository.js");

function purchaseItem(userId, definitionId) {
    const definition = itemDefinitionRepository.getById(definitionId);

    if (!definition) {
        return {
            success: false,
            message: "Item not found.",
        };
    }

    if (playerItemRepository.ownsItem(userId, definitionId)) {
        return {
            success: false,
            message: "You already own this item.",
        };
    }

    const money = playerRepository.getMoneyCents(userId);

    if (money < definition.costCents) {
        return {
            success: false,
            message: "Not enough money.",
        };
    }

    playerRepository.addMoneyCents(userId, -definition.costCents);

    const playerItemId = playerItemRepository.addItem(userId, definitionId);
    const effects = itemDefinitionRepository.getDefinitionEffects(definitionId);

    for (const effect of effects) {
        playerItemRepository.addEffect(playerItemId, effect.effectType, effect.effectData);
    }

    return {
        success: true,
        item: {
            playerItemId,
            name: definition.name,
            icon: definition.icon,
            effects,
        },
    };
}

module.exports = {
    purchaseItem,
};
