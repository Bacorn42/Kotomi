const db = require("../../../database/db");

const getSettingsByUser = db.prepare(`
    SELECT *
    FROM ChatSettings
    WHERE UserID = ?
`);

const insertSettings = db.prepare(`
    INSERT INTO ChatSettings (UserID)
    VALUES (?)
    ON CONFLICT(UserID) DO NOTHING
`);

const updateSettings = db.prepare(`
    UPDATE ChatSettings
    SET DefaultModel = ?,
        ContextWindow = ?,
        Temperature = ?
    WHERE UserID = ?
`);

function getByUser(userId) {
    insertSettings.run(userId);
    return getSettingsByUser.get(userId);
}

function save(userId, settings) {
    insertSettings.run(userId);

    updateSettings.run(settings.defaultModel, settings.contextWindow, settings.temperature, userId);

    return getSettingsByUser.get(userId);
}

module.exports = {
    getByUser,
    save,
};
