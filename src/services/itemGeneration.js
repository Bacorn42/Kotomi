const itemRepository = require("../repositories/itemDefinitionRepository.js");
const playerItemRepository = require("../repositories/playerItemRepository.js");
const { getRandomRarity } = require("../utils/rarity.js");
const { scaleEffect } = require("../utils/itemScaling.js");

function generateItem(userId) {
    const definition = itemRepository.getRandomGeneratedDefinition();

    if (!definition) {
        return null;
    }

    const rarity = getRandomRarity();

    const playerItem = playerItemRepository.createPlayerItem({
        userId,
        definitionId: definition.DefinitionID,
        rarity: rarity.name,
        generatedName: `${rarity.name} ${definition.Name}`,
    });

    const effects = itemRepository.getEffects(definition.DefinitionID);

    for (const effect of effects) {
        const data = scaleEffect(JSON.parse(effect.EffectData), rarity.multiplier);

        playerItemRepository.addEffect({
            playerItemId: playerItem.lastInsertRowid,
            effectType: effect.EffectType,
            effectData: JSON.stringify(data),
        });
    }

    return playerItem;
}

module.exports = {
    generateItem,
};
