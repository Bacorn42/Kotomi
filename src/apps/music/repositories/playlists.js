const db = require("../../../database/db");

const getPlaylistsByUser = db.prepare(`
    SELECT
        p.*,
        COUNT(pt.TrackID) AS TrackCount
    FROM MusicPlaylists p
    LEFT JOIN MusicPlaylistTracks pt
        ON pt.PlaylistID = p.PlaylistID
    WHERE p.UserID = ?
    GROUP BY p.PlaylistID
    ORDER BY p.UpdatedDate DESC, p.PlaylistID DESC
`);

const getPlaylistById = db.prepare(`
    SELECT *
    FROM MusicPlaylists
    WHERE PlaylistID = ? AND UserID = ?
`);

const getPlaylistTracks = db.prepare(`
    SELECT
        t.*,
        pt.Position
    FROM MusicPlaylistTracks pt
    JOIN MusicTracks t
        ON t.TrackID = pt.TrackID
    WHERE pt.PlaylistID = ? AND pt.UserID = ?
    ORDER BY pt.Position ASC
`);

const getNextPosition = db.prepare(`
    SELECT COALESCE(MAX(Position) + 1, 0) AS Position
    FROM MusicPlaylistTracks
    WHERE PlaylistID = ? AND UserID = ?
`);

const insertPlaylist = db.prepare(`
    INSERT INTO MusicPlaylists (
        UserID,
        Name,
        Description
    )
    VALUES (?, ?, ?)
`);

const updatePlaylist = db.prepare(`
    UPDATE MusicPlaylists
    SET
        Name = @Name,
        Description = @Description,
        UpdatedDate = CURRENT_TIMESTAMP
    WHERE PlaylistID = @PlaylistID AND UserID = @UserID
`);

const updatePlaylistArtwork = db.prepare(`
    UPDATE MusicPlaylists
    SET
        ArtworkStorageKey = ?,
        UpdatedDate = CURRENT_TIMESTAMP
    WHERE PlaylistID = ? AND UserID = ?
`);

const deletePlaylist = db.prepare(`
    DELETE FROM MusicPlaylists
    WHERE PlaylistID = ? AND UserID = ?
`);

const insertPlaylistTrack = db.prepare(`
    INSERT OR IGNORE INTO MusicPlaylistTracks (
        UserID,
        PlaylistID,
        TrackID,
        Position
    )
    VALUES (?, ?, ?, ?)
`);

const deletePlaylistTrack = db.prepare(`
    DELETE FROM MusicPlaylistTracks
    WHERE UserID = ? AND PlaylistID = ? AND TrackID = ?
`);

const updatePlaylistDate = db.prepare(`
    UPDATE MusicPlaylists
    SET UpdatedDate = CURRENT_TIMESTAMP
    WHERE PlaylistID = ? AND UserID = ?
`);

const addTrackTransaction = db.transaction((userID, playlistID, trackID) => {
    const position = getNextPosition.get(playlistID, userID).Position;

    const result = insertPlaylistTrack.run(userID, playlistID, trackID, position);

    if (result.changes > 0) {
        updatePlaylistDate.run(playlistID, userID);
    }

    return result.changes > 0;
});

const removeTrackTransaction = db.transaction((userID, playlistID, trackID) => {
    const result = deletePlaylistTrack.run(userID, playlistID, trackID);

    if (result.changes > 0) {
        updatePlaylistDate.run(playlistID, userID);
    }

    return result.changes > 0;
});

function getAll(userID) {
    return getPlaylistsByUser.all(userID);
}

function getById(playlistID, userID) {
    return getPlaylistById.get(playlistID, userID) || null;
}

function getTracks(playlistID, userID) {
    return getPlaylistTracks.all(playlistID, userID);
}

function create(userID, name, description = null) {
    const result = insertPlaylist.run(userID, name, description);
    return result.lastInsertRowid;
}

function update(playlist) {
    return updatePlaylist.run(playlist).changes > 0;
}

function updateArtwork(artworkStorageKey, playlistID, userID) {
    return updatePlaylistArtwork.run(artworkStorageKey, playlistID, userID).changes > 0;
}

function remove(playlistID, userID) {
    return deletePlaylist.run(playlistID, userID).changes > 0;
}

function addTrack(userID, playlistID, trackID) {
    return addTrackTransaction(userID, playlistID, trackID);
}

function removeTrack(userID, playlistID, trackID) {
    return removeTrackTransaction(userID, playlistID, trackID);
}

module.exports = {
    getAll,
    getById,
    getTracks,
    create,
    update,
    updateArtwork,
    remove,
    addTrack,
    removeTrack,
};
