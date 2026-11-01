const db = require("../../../database/db");

const getTagsByUser = db.prepare(`
    SELECT
        t.*,
        COUNT(tt.TrackID) AS TrackCount
    FROM MusicTags t
    LEFT JOIN MusicTrackTags tt
        ON tt.TagID = t.TagID
    WHERE t.UserID = ?
    GROUP BY t.TagID
    ORDER BY t.Name COLLATE NOCASE ASC
`);

const getTagById = db.prepare(`
    SELECT *
    FROM MusicTags
    WHERE TagID = ? AND UserID = ?
`);

const getTagsByTrack = db.prepare(`
    SELECT t.*
    FROM MusicTags t
    JOIN MusicTrackTags tt
        ON tt.TagID = t.TagID
    WHERE tt.TrackID = ? AND tt.UserID = ?
    ORDER BY t.Name COLLATE NOCASE ASC
`);

const insertTag = db.prepare(`
    INSERT INTO MusicTags (UserID, Name)
    VALUES (?, ?)
`);

const deleteTag = db.prepare(`
    DELETE FROM MusicTags
    WHERE TagID = ? AND UserID = ?
`);

const insertTrackTag = db.prepare(`
    INSERT OR IGNORE INTO MusicTrackTags (
        UserID,
        TrackID,
        TagID
    )
    VALUES (?, ?, ?)
`);

const deleteTrackTag = db.prepare(`
    DELETE FROM MusicTrackTags
    WHERE UserID = ? AND TrackID = ? AND TagID = ?
`);

function getAll(userID) {
    return getTagsByUser.all(userID);
}

function getById(tagID, userID) {
    return getTagById.get(tagID, userID) || null;
}

function getForTrack(trackID, userID) {
    return getTagsByTrack.all(trackID, userID);
}

function create(userID, name) {
    const result = insertTag.run(userID, name);
    return result.lastInsertRowid;
}

function remove(tagID, userID) {
    return deleteTag.run(tagID, userID).changes > 0;
}

function addToTrack(userID, trackID, tagID) {
    return insertTrackTag.run(userID, trackID, tagID).changes > 0;
}

function removeFromTrack(userID, trackID, tagID) {
    return deleteTrackTag.run(userID, trackID, tagID).changes > 0;
}

module.exports = {
    getAll,
    getById,
    getForTrack,
    create,
    remove,
    addToTrack,
    removeFromTrack,
};
