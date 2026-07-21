const db = require("../database/db");

const insertImage = db.prepare(`
    INSERT INTO Images (
        Filename,
        Prompt,
        EnhancedPrompt,
        Width,
        Height,
        Steps,
        Seed,
        Model,
        CreatedDate
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const getImageById = db.prepare(`
   SELECT *
   FROM Images
   WHERE ImageID = ? 
`);

const getRecentImages = db.prepare(`
    SELECT *
    FROM Images
    ORDER BY CreatedDate DESC
    LIMIT ?
`);

const deleteImage = db.prepare(`
    DELETE FROM Images
    WHERE ImageID = ?
`);

function save(image) {
    const result = insertImage.run(
        image.filename,
        image.prompt,
        image.enhancedPrompt,
        image.width,
        image.height,
        image.steps,
        image.seed,
        image.model,
        image.createdDate,
    );
    return result.lastInsertRowid;
}

function getById(id) {
    return getImageById.get(id);
}

function getRecent(limit = 50) {
    return getRecentImages.all(limit);
}

function deleteById(id) {
    return deleteImage.run(id);
}

module.exports = {
    save,
    getById,
    getRecent,
    deleteById,
};
