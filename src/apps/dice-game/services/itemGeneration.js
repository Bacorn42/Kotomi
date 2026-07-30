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
    const generatedName = `${rarity.name} ${definition.Name}`;

    const playerItemId = playerItemRepository.addItem(
        userId,
        definition.DefinitionID,
        generatedName,
        rarity.name,
    );

    const effects = itemRepository.getDefinitionEffects(definition.DefinitionID);
    const scaledEffects = effects.map((effect) => ({
        effectType: effect.effectType,
        effectData: scaleEffect(effect.effectType, effect.effectData, rarity.multiplier),
    }));

    for (const effect of scaledEffects) {
        playerItemRepository.addEffect(playerItemId, effect.effectType, effect.effectData);
    }

    return {
        playerItemId,
        name: generatedName,
        rarity: rarity.name,
        icon: definition.Icon,
        effects: scaledEffects,
    };
}

module.exports = {
    generateItem,
};
