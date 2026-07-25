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
            effectData: JSON.parse(effect.EffectData),
            effectType: effect.EffectType,
        }));
}

function exists(name) {
    return db
        .prepare(
            `
        SELECT 1
        FROM ItemDefinitions
        WHERE Name = ?
    `,
        )
        .get(name);
}

function createDefinition(definition) {
    const result = db
        .prepare(
            `
        INSERT INTO ItemDefinitions
        (
            Name,
            Description,
            Icon,
            CostCents,
            CanGenerate
        )
        VALUES (?, ?, ?, ?, ?)
    `,
        )
        .run(
            definition.name,
            definition.description,
            definition.icon,
            definition.costCents,
            definition.canGenerate ? 1 : 0,
        );

    const definitionId = result.lastInsertRowid;

    const insertEffect = db.prepare(`
        INSERT INTO ItemDefinitionEffects
        (
            DefinitionID,
            EffectType,
            EffectData
        )
        VALUES (?, ?, ?)
    `);

    for (const effect of definition.effects) {
        insertEffect.run(definitionId, effect.type, JSON.stringify(effect.data));
    }
}

module.exports = {
    getAll,
    getById,
    getEffects,
    exists,
    createDefinition,
};
