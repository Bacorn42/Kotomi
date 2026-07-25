const db = require("../database/db.js");

function getInventory(userId) {
    return db
        .prepare(
            `
        SELECT *
        FROM PlayerItems
        WHERE UserID = ?
        ORDER BY ObtainedDate DESC
    `,
        )
        .all(userId);
}

function addItem(userId, definitionId, generatedName = null, rarity = null) {
    return db
        .prepare(
            `
        INSERT INTO PlayerItems
        (
            UserID,
            DefinitionID,
            GeneratedName,
            Rarity
        )
        VALUES (?, ?, ?, ?)
    `,
        )
        .run(userId, definitionId, generatedName, rarity);
}

function equip(playerItemId) {
    db.prepare(
        `
        UPDATE PlayerItems
        SET IsEquipped = 1
        WHERE PlayerItemID = ?
    `,
    ).run(playerItemId);
}

function unequip(playerItemId) {
    db.prepare(
        `
        UPDATE PlayerItems
        SET IsEquipped = 0
        WHERE PlayerItemID = ?
    `,
    ).run(playerItemId);
}

function getEquipped(userId) {
    return db
        .prepare(
            `
        SELECT *
        FROM PlayerItems
        WHERE UserID = ?
          AND IsEquipped = 1
    `,
        )
        .all(userId);
}

module.exports = {
    getInventory,
    addItem,
    equip,
    unequip,
    getEquipped,
};
