const playerItemRepository = require("../repositories/playerItemRepository.js");
const upgradeRepository = require("../repositories/upgradeRepository.js");
const { applyEffects } = require("./diceEffects.js");

function getPlayerConfiguration(baseConfiguration, userId) {
    const configuration = {
        ...baseConfiguration,
        weights: [...baseConfiguration.weights],
    };

    const equippedItems = playerItemRepository.getEquipped(userId);
    let effects = [];

    for (const item of equippedItems) {
        const itemEffects = playerItemRepository.getEffects(item.PlayerItemID);

        effects.push(...itemEffects);
    }

    const upgrades = upgradeRepository.getPlayerUpgrades(userId);

    for (const upgrade of upgrades) {
        if (upgrade.UpgradeType === "active_item_slots") {
            player.MaxActiveItems += JSON.parse(upgrade.UpgradeData).amount;
        }
    }

    return applyEffects(configuration, effects);
}

module.exports = {
    getPlayerConfiguration,
};
