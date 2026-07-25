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
    const transaction = db.transaction(() => {
        const upgrade = db
            .prepare(
                `
                SELECT *
                FROM UpgradeDefinitions
                WHERE UpgradeID = ?
            `,
            )
            .get(upgradeId);

        if (!upgrade) {
            throw new Error("Upgrade not found");
        }

        const player = db
            .prepare(
                `
                SELECT MoneyCents
                FROM Players
                WHERE UserID = ?
            `,
            )
            .get(userId);

        if (player.MoneyCents < upgrade.CostCents) {
            throw new Error("Not enough money");
        }

        db.prepare(
            `
            UPDATE Players
            SET MoneyCents = MoneyCents - ?
            WHERE UserID = ?
        `,
        ).run(upgrade.CostCents, userId);

        db.prepare(
            `
            INSERT INTO PlayerUpgrades
            (
                UserID,
                UpgradeID
            )
            VALUES (?, ?)
        `,
        ).run(userId, upgradeId);

        if (upgrade.UpgradeType === "active_item_slots") {
            const data = JSON.parse(upgrade.UpgradeData);

            db.prepare(
                `
                UPDATE Players
                SET MaxActiveItems =
                    MaxActiveItems + ?
                WHERE UserID = ?
            `,
            ).run(data.amount, userId);
        }
    });

    transaction();
}

function getPlayerUpgrades(userId) {
    return db
        .prepare(
            `
        SELECT
            ud.UpgradeType,
            ud.UpgradeData
        FROM PlayerUpgrades pu
        JOIN UpgradeDefinitions ud ON ud.UpgradeID = pu.UpgradeID
        WHERE pu.UserID = ?
        `,
        )
        .all(userId);
}

module.exports = {
    getAvailableUpgrades,
    purchaseUpgrade,
    getPlayerUpgrades,
};
