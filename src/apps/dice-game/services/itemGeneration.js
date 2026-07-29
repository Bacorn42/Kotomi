const itemRepository = require("../repositories/itemDefinitionRepository.js");
const playerItemRepository = require("../repositories/playerItemRepository.js");
const { getRandomRarity } = require("../core/rarity.js");
const { scaleEffect } = require("../core/itemScaling.js");

function generateItem(userId) {
    const definition = itemRepository.getRandomGeneratedDefinition();

    if (!definition) {
        return null;
    }

    const rarity = getRandomRarity();

    const playerItemId = playerItemRepository.addItem(
        userId,
        definition.DefinitionID,
        `${rarity.name} ${definition.Name}`,
        rarity.name,
    );

    const effects = itemRepository.getDefinitionEffects(definition.DefinitionID);

    for (const effect of effects) {
        const data = scaleEffect(effect.effectType, effect.effectData, rarity.multiplier);

        playerItemRepository.addEffect(playerItemId, effect.effectType, data);
    }

    return {
        playerItemId: playerItemId,
        name: `${rarity.name} ${definition.Name}`,
        rarity: rarity.name,
        icon: definition.Icon,
        effects: effects.map((effect) => ({
            effectType: effect.effectType,
            effectData: scaleEffect(effect.effectType, effect.effectData, rarity.multiplier),
        })),
    };
}

module.exports = {
    generateItem,
};
