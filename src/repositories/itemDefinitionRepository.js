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

function getAllShopItems() {
    return db
        .prepare(
            `
        SELECT *
        FROM ItemDefinitions
        WHERE CanGenerate = 0
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
            CanGenerate,
            DropWeight
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `,
        )
        .run(
            definition.name,
            definition.description,
            definition.icon,
            definition.costCents,
            definition.canGenerate ? 1 : 0,
            definition.dropWeight,
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

function getRandomGeneratedDefinition() {
    const definitions = db
        .prepare(
            `
        SELECT *
        FROM ItemDefinitions
        WHERE CanGenerate = 1
    `,
        )
        .all();

    const totalWeight = definitions.reduce((sum, item) => sum + item.DropWeight, 0);

    let roll = Math.random() * totalWeight;

    for (const definition of definitions) {
        roll -= definition.DropWeight;

        if (roll < 0) {
            return definition;
        }
    }

    return definitions[definitions.length - 1];
}

module.exports = {
    getAll,
    getAllShopItems,
    getById,
    getEffects,
    exists,
    createDefinition,
    getRandomGeneratedDefinition,
};
