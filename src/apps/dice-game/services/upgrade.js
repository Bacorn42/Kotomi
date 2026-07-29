const upgradeRepository = require("../repositories/upgradeRepository.js");
const playerRepository = require("../repositories/playerRepository.js");

function purchaseUpgrade(userId, upgradeId) {
    const upgrade = upgradeRepository.getById(upgradeId);

    if (!upgrade) {
        throw new Error(`Upgrade ${upgradeId} does not exist`);
    }

    if (upgradeRepository.hasPlayerUpgrade(userId, upgradeId)) {
        throw new Error("Upgrade already purchased");
    }

    const player = playerRepository.getPlayer(userId);

    if (player.moneyCents < upgrade.costCents) {
        throw new Error(`Insufficient money`);
    }

    playerRepository.addMoneyCents(userId, -upgrade.costCents);

    upgradeRepository.addPlayerUpgrade(userId, upgradeId);

    switch (upgrade.upgradeType) {
        case "active_item_slots":
            upgradeRepository.applyActiveItemSlots(userId, upgrade.data.amount);
            break;
    }

    return {
        success: true,
        upgradeId,
    };
}

module.exports = {
    purchaseUpgrade,
};
