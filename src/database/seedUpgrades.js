const db = require("./db.js");
const upgrades = require("./upgradeDefinitions.js");

function seedUpgrades() {
    const insertUpgrade = db.prepare(`
            INSERT INTO UpgradeDefinitions
            (
                Name,
                Description,
                CostCents,
                UpgradeType,
                UpgradeData
            )
            VALUES (?, ?, ?, ?, ?)
        `);

    const insertMany = db.transaction(() => {
        for (const upgrade of upgrades) {
            const exists = db
                .prepare(
                    `
                        SELECT 1
                        FROM UpgradeDefinitions
                        WHERE Name = ?
                    `,
                )
                .get(upgrade.name);

            if (!exists) {
                insertUpgrade.run(
                    upgrade.name,
                    upgrade.description,
                    upgrade.costCents,
                    upgrade.upgradeType,
                    JSON.stringify(upgrade.data),
                );
            }
        }
    });

    insertMany();
}

module.exports = {
    seedUpgrades,
};
