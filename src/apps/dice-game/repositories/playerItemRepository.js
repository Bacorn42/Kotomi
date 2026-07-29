const db = require("../../../database/db.js");

function getInventory(userId) {
    return db
        .prepare(
            `
            SELECT
                PlayerItemID,
                DefinitionID,
                GeneratedName,
                Rarity,
                IsEquipped,
                ObtainedDate
            FROM DiceGamePlayerItems
            WHERE UserID = ?
            ORDER BY ObtainedDate DESC
            `,
        )
        .all(userId)
        .map((item) => ({
            playerItemId: item.PlayerItemID,
            definitionId: item.DefinitionID,
            generatedName: item.GeneratedName,
            rarity: item.Rarity,
            equipped: Boolean(item.IsEquipped),
            obtainedDate: item.ObtainedDate,
        }));
}

function ownsItem(userId, definitionId) {
    return !!db
        .prepare(
            `
        SELECT 1
        FROM DiceGamePlayerItems
        WHERE UserID = ?
          AND DefinitionID = ?
    `,
        )
        .get(userId, definitionId);
}

function addItem(userId, definitionId, generatedName = null, rarity = null) {
    const result = db
        .prepare(
            `
        INSERT INTO DiceGamePlayerItems
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
        INSERT INTO DiceGamePlayerItemEffects
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
            DiceGamePlayerItems.*
        FROM DiceGamePlayerItems
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
        FROM DiceGamePlayerItems
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
        FROM DiceGamePlayerItemEffects
        WHERE PlayerItemID = ?
    `,
        )
        .all(playerItemId)
        .map((effect) => ({
            effectType: effect.EffectType,
            effectData: JSON.parse(effect.EffectData),
        }));
}

function equip(userId, playerItemId) {
    db
        .prepare(
            `
        UPDATE DiceGamePlayerItems
        SET IsEquipped = 1
        WHERE UserID = ?
            AND PlayerItemID = ?
    `,
        )
        .run(userId, playerItemId).changes;
}

function unequip(userId, playerItemId) {
    db
        .prepare(
            `
        UPDATE DiceGamePlayerItems
        SET IsEquipped = 0
        WHERE UserID = ?
            AND PlayerItemID = ?
    `,
        )
        .run(userId, playerItemId).changes;
}

function getItemCount(userId) {
    return db
        .prepare(
            `
            SELECT COUNT(*) AS Count
            FROM DiceGamePlayerItems
            WHERE UserID = ?
            `,
        )
        .get(userId).Count;
}

module.exports = {
    getInventory,
    ownsItem,
    addItem,
    addEffect,
    getEquipped,
    getEquippedCount,
    getItemEffects,
    equip,
    unequip,
    getItemCount,
};
