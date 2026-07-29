function purchaseUpgrade(userId, upgradeId) {
    const upgrade = repository.getById(upgradeId);

    if (!upgrade) {
        throw new Error(`Upgrade ${upgradeId} does not exist`);
    }

    if (repository.hasPlayerUpgrade(userId, upgradeId)) {
        throw new Error("Upgrade already purchased");
    }

    const player = playerRepository.getPlayer(userId);

    if (player.MoneyCents < upgrade.CostCents) {
        throw new Error(`Insufficient money`);
    }

    playerRepository.addMoneyCents(userId, -upgrade.CostCents);

    repository.addPlayerUpgrade(userId, upgradeId);

    switch (upgrade.UpgradeType) {
        case "active_item_slots":
            repository.applyActiveItemSlots(userId, upgrade.UpgradeData.amount);
            break;
    }
}

module.exports = {
    purchaseUpgrade,
};
