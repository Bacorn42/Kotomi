const db = require("../../../database/db.js");

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
    const result = db
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

    return result.lastInsertRowid;
}

function addEffect(playerItemId, effectType, effectData) {
    db.prepare(
        `
        INSERT INTO PlayerItemEffects
        (
            PlayerItemID,
            EffectType,
            EffectData
        )
        VALUES (?, ?, ?)
    `,
    ).run(playerItemId, effectType, JSON.stringify(effectData));
}

function getEquipped(userId) {
    return db
        .prepare(
            `
        SELECT
            PlayerItems.*
        FROM PlayerItems
        WHERE UserID = ?
          AND IsEquipped = 1
    `,
        )
        .all(userId);
}

function getEquippedCount(userId) {
    return db
        .prepare(
            `
        SELECT COUNT(*) AS Count
        FROM PlayerItems
        WHERE UserID = ?
          AND IsEquipped = 1
    `,
        )
        .get(userId).Count;
}

function getItemEffects(playerItemId) {
    return db
        .prepare(
            `
        SELECT *
        FROM PlayerItemEffects
        WHERE PlayerItemID = ?
    `,
        )
        .all(playerItemId)
        .map((effect) => ({
            effectType: effect.EffectType,
            effectData: JSON.parse(effect.EffectData),
        }));
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

function getItemCount(userId) {
    return db
        .prepare(
            `
            SELECT COUNT(*) AS Count
            FROM PlayerItems
            WHERE UserID = ?
            `,
        )
        .get(userId).Count;
}

module.exports = {
    getInventory,
    addItem,
    addEffect,
    getEquipped,
    getEquippedCount,
    getItemEffects,
    equip,
    unequip,
    getItemCount,
};
