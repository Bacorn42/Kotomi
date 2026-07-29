const db = require("../../../database/db.js");
const upgrades = require("./upgradeDefinitions.js");

function seedUpgrades() {
    const insertUpgrade = db.prepare(`
            INSERT INTO DiceGameUpgradeDefinitions
            (
                Name,
                Description,
                CostCents,
                UpgradeType,
                UpgradeData
            )
            VALUES (?, ?, ?, ?, ?)
        `);

    const exists = db.prepare(`
        SELECT 1
        FROM DiceGameUpgradeDefinitions
        WHERE Name = ?
    `);

    const insertMany = db.transaction(() => {
        for (const upgrade of upgrades) {
            if (!exists.get(upgrade.name)) {
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
