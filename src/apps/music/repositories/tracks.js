const db = require("../../../database/db");

const getTracksByUser = db.prepare(`
    SELECT *
    FROM MusicTracks
    WHERE UserID = ?
    ORDER BY AddedDate DESC, TrackID DESC
`);

const getTrackById = db.prepare(`
    SELECT *
    FROM MusicTracks
    WHERE TrackID = ? AND UserID = ?
`);

const insertTrack = db.prepare(`
    INSERT INTO MusicTracks (
        UserID,
        StorageKey,
        OriginalFilename,
        Title,
        Artist,
        Album,
        AlbumArtist,
        Genre,
        Duration,
        FileSize,
        Format,
        MimeType,
        TrackNumber,
        DiscNumber,
        FileHash,
        ArtworkStorageKey
    )
    VALUES (
        @UserID,
        @StorageKey,
        @OriginalFilename,
        @Title,
        @Artist,
        @Album,
        @AlbumArtist,
        @Genre,
        @Duration,
        @FileSize,
        @Format,
        @MimeType,
        @TrackNumber,
        @DiscNumber,
        @FileHash,
        @ArtworkStorageKey
    )
`);

const updateTrackMetadata = db.prepare(`
    UPDATE MusicTracks
    SET
        Title = @Title,
        Artist = @Artist,
        Album = @Album,
        AlbumArtist = @AlbumArtist,
        Genre = @Genre,
        TrackNumber = @TrackNumber,
        DiscNumber = @DiscNumber,
        UpdatedDate = CURRENT_TIMESTAMP
    WHERE TrackID = @TrackID AND UserID = @UserID
`);

const deleteTrack = db.prepare(`
    DELETE FROM MusicTracks
    WHERE TrackID = ? AND UserID = ?
`);

function getAll(userID) {
    return getTracksByUser.all(userID);
}

function getById(trackID, userID) {
    return getTrackById.get(trackID, userID) || null;
}

function create(track) {
    const result = insertTrack.run(track);
    return result.lastInsertRowid;
}

function updateMetadata(track) {
    return updateTrackMetadata.run(track).changes > 0;
}

function remove(trackID, userID) {
    return deleteTrack.run(trackID, userID).changes > 0;
}

module.exports = {
    getAll,
    getById,
    create,
    updateMetadata,
    remove,
};
