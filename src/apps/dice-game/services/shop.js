const db = require("../../../database/db.js");
const playerRepository = require("../repositories/playerRepository.js");
const playerItemRepository = require("../repositories/playerItemRepository.js");
const itemDefinitionRepository = require("../repositories/itemDefinitionRepository.js");

const buyItem = db.transaction((userId, definitionId) => {
    const definition = itemDefinitionRepository.getById(definitionId);

    if (!definition) {
        return {
            success: false,
            message: "Item not found.",
        };
    }

    const owned = playerItemRepository
        .getInventory(userId)
        .some((item) => item.DefinitionID === definitionId);

    if (owned) {
        return {
            success: false,
            message: "You already own this item.",
        };
    }

    const money = playerRepository.getMoneyCents(userId);

    if (money < definition.CostCents) {
        return {
            success: false,
            message: "Not enough money.",
        };
    }

    playerRepository.addMoneyCents(userId, -definition.CostCents);

    const playerItemId = playerItemRepository.addItem(userId, definitionId);
    const effects = itemDefinitionRepository.getDefinitionEffects(definitionId);

    for (const effect of effects) {
        playerItemRepository.addEffect(playerItemId, effect.effectType, effect.effectData);
    }

    return {
        success: true,
        playerItemId,
    };
});

module.exports = {
    buyItem,
};
