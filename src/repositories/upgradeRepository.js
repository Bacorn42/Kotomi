const db = require("../database/db.js");

function getAvailableUpgrades(userId) {
    return db
        .prepare(
            `
        SELECT
            u.*,
            CASE
                WHEN pu.PlayerUpgradeID IS NULL
                THEN 0
                ELSE 1
            END AS Purchased
        FROM UpgradeDefinitions u
        LEFT JOIN PlayerUpgrades pu
            ON pu.UpgradeID = u.UpgradeID
            AND pu.UserID = ?

    `,
        )
        .all(userId)
        .map((upgrade) => ({
            upgradeId: upgrade.UpgradeID,
            name: upgrade.Name,
            description: upgrade.Description,
            costCents: upgrade.CostCents,
            upgradeType: upgrade.UpgradeType,
            data: JSON.parse(upgrade.UpgradeData),
            purchased: upgrade.Purchased === 1,
        }));
}

function purchaseUpgrade(userId, upgradeId) {
    return db
        .prepare(
            `
        INSERT INTO PlayerUpgrades
        (
            UserID,
            UpgradeID
        )
        VALUES (?, ?)
    `,
        )
        .run(userId, upgradeId);
}

module.exports = {
    getAvailableUpgrades,
    purchaseUpgrade,
};
