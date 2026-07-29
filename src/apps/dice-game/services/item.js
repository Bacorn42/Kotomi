const playerItemRepository = require("../repositories/playerItemRepository.js");
const playerRepository = require("../repositories/playerRepository.js");

function equipItem(userId, playerItemId) {
    const settings = playerRepository.getPlayerSettings(userId);
    const equippedCount = playerItemRepository.getEquippedCount(userId);

    if (equippedCount >= settings.maxActiveItems) {
        return {
            success: false,
            message: "Maximum equipped items reached.",
        };
    }

    const updated = playerItemRepository.equip(userId, playerItemId);

    if (!updated) {
        return {
            success: false,
            message: "Item not found.",
        };
    }

    return {
        success: true,
    };
}

function unequipItem(userId, playerItemId) {
    const updated = playerItemRepository.unequip(userId, playerItemId);

    if (!updated) {
        return {
            success: false,
            message: "Item not found.",
        };
    }

    return {
        success: true,
    };
}

module.exports = {
    equipItem,
    unequipItem,
};
