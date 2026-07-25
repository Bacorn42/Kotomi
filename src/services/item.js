const playerItemRepository = require("../repositories/playerItemRepository.js");
const playerRepository = require("../repositories/playerRepository.js");

function equipItem(userId, playerItemId) {
    const settings = playerRepository.getPlayerSettings(userId);
    const equippedCount = playerItemRepository.getEquippedCount(userId);

    if (equippedCount >= settings.MaxActiveItems) {
        return {
            success: false,
            message: "Maximum equipped items reached.",
        };
    }

    playerItemRepository.equip(playerItemId);

    return {
        success: true,
    };
}

function unequipItem(userId, playerItemId) {
    playerItemRepository.unequip(playerItemId);

    return {
        success: true,
    };
}

module.exports = {
    equipItem,
    unequipItem,
};
