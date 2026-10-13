const db = require("../../../database/db");

const insertImage = db.prepare(`
    INSERT INTO ImageGeneratorImages (
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

const getRecentImages = db.prepare(`
    SELECT *
    FROM ImageGeneratorImages
    WHERE UserID = ?
    ORDER BY CreatedDate DESC
    LIMIT ?
`);

const getImageByIdAndUser = db.prepare(`
    SELECT *
    FROM ImageGeneratorImages
    WHERE ImageID = ? AND UserID = ?
`);

const deleteImage = db.prepare(`
    DELETE FROM ImageGeneratorImages
    WHERE ImageID = ? AND UserID = ?
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

function getRecent(userId, limit = 50) {
    return getRecentImages.all(userId, limit);
}

function getByIdAndUser(id, userId) {
    return getImageByIdAndUser.get(id, userId);
}

function deleteById(id, userId) {
    return deleteImage.run(id, userId);
}

module.exports = {
    save,
    getRecent,
    getByIdAndUser,
    deleteById,
};
