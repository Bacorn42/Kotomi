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

function save(image) {
    insertImage.run(
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
}

module.exports = {
    save,
};
