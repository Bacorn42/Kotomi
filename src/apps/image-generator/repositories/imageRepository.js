const db = require("../../../database/db");

const insertImage = db.prepare(`
    INSERT INTO Images (
        UserID,
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
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const getImageById = db.prepare(`
   SELECT *
   FROM Images
   WHERE ImageID = ? 
`);

const getRecentImages = db.prepare(`
    SELECT *
    FROM Images
    WHERE UserID = ?
    ORDER BY CreatedDate DESC
    LIMIT ?
`);

const deleteImage = db.prepare(`
    DELETE FROM Images
    WHERE ImageID = ?
`);

function save(userId, image) {
    const result = insertImage.run(
        userId,
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

function getRecent(userId, limit = 50) {
    return getRecentImages.all(userId, limit);
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
