const db = require("../database/db.js");

function getAll() {
    return db
        .prepare(
            `
        SELECT *
        FROM ItemDefinitions
        ORDER BY CostCents
    `,
        )
        .all();
}

function getById(definitionId) {
    return db
        .prepare(
            `
        SELECT *
        FROM ItemDefinitions
        WHERE DefinitionID = ?
    `,
        )
        .get(definitionId);
}

function getEffects(definitionId) {
    return db
        .prepare(
            `
        SELECT *
        FROM ItemDefinitionEffects
        WHERE DefinitionID = ?
        ORDER BY EffectID
    `,
        )
        .all(definitionId)
        .map((effect) => ({
            effectId: effect.EffectID,
            type: effect.EffectType,
            data: JSON.parse(effect.EffectData),
        }));
}

module.exports = {
    getAll,
    getById,
    getEffects,
};
