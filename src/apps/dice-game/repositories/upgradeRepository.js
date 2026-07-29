const db = require("../../../database/db.js");

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
        FROM DiceGameUpgradeDefinitions u
        LEFT JOIN DiceGamePlayerUpgrades pu
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

function getById(upgradeId) {
    const upgrade = db
        .prepare(
            `
                SELECT *
                FROM DiceGameUpgradeDefinitions
                WHERE UpgradeID = ?
            `,
        )
        .get(upgradeId);

    if (!upgrade) {
        return null;
    }

    return {
        upgradeId: upgrade.UpgradeID,
        name: upgrade.Name,
        description: upgrade.Description,
        costCents: upgrade.CostCents,
        upgradeType: upgrade.UpgradeType,
        data: JSON.parse(upgrade.UpgradeData),
    };
}

function addPlayerUpgrade(userId, upgradeId) {
    db.prepare(
        `
            INSERT INTO DiceGamePlayerUpgrades
            (
                UserID,
                UpgradeID
            )
            VALUES (?, ?)
        `,
    ).run(userId, upgradeId);
}

function applyActiveItemSlots(userId, amount) {
    db.prepare(
        `
                UPDATE DiceGamePlayers
                SET MaxActiveItems =
                    MaxActiveItems + ?
                WHERE UserID = ?
            `,
    ).run(amount, userId);
}

function hasPlayerUpgrade(userId, upgradeId) {
    return !!db
        .prepare(
            `
            SELECT 1
            FROM DiceGamePlayerUpgrades
            WHERE UserID = ?
                AND UpgradeID = ?
        `,
        )
        .get(userId, upgradeId);
}

function getPlayerUpgrades(userId) {
    return db
        .prepare(
            `
        SELECT
            ud.UpgradeType,
            ud.UpgradeData
        FROM DiceGamePlayerUpgrades pu
        JOIN DiceGameUpgradeDefinitions ud ON ud.UpgradeID = pu.UpgradeID
        WHERE pu.UserID = ?
        `,
        )
        .all(userId);
}

module.exports = {
    getAvailableUpgrades,
    getById,
    addPlayerUpgrade,
    applyActiveItemSlots,
    hasPlayerUpgrade,
    getPlayerUpgrades,
};
