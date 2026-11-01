const tracksRepository = require("../repositories/tracks");
const playlistsRepository = require("../repositories/playlists");
const tagsRepository = require("../repositories/tags");

function getTracks(userID) {
    return tracksRepository.getAll(userID).map((track) => ({
        TrackID: track.TrackID,
        Title: track.Title,
        Artist: track.Artist,
        Album: track.Album,
        AlbumArtist: track.AlbumArtist,
        Genre: track.Genre,
        Duration: track.Duration,
        FileSize: track.FileSize,
        Format: track.Format,
        TrackNumber: track.TrackNumber,
        DiscNumber: track.DiscNumber,
        AddedDate: track.AddedDate,
        ArtworkURL: track.ArtworkStorageKey ? `/api/music/tracks/${track.TrackID}/artwork` : null,
        Tags: tagsRepository.getForTrack(track.TrackID, userID).map((tag) => ({
            TagID: tag.TagID,
            Name: tag.Name,
        })),
    }));
}

function getPlaylists(userID) {
    return playlistsRepository.getAll(userID).map((playlist) => ({
        PlaylistID: playlist.PlaylistID,
        Name: playlist.Name,
        Description: playlist.Description,
        TrackCount: playlist.TrackCount,
        CreatedDate: playlist.CreatedDate,
        UpdatedDate: playlist.UpdatedDate,
    }));
}

function getPlaylistTracks(playlistID, userID) {
    const playlist = playlistsRepository.getById(playlistID, userID);

    if (!playlist) {
        return null;
    }

    const tracks = playlistsRepository.getTracks(playlistID, userID);

    return tracks.map((track) => ({
        TrackID: track.TrackID,
        Title: track.Title,
        Artist: track.Artist,
        Album: track.Album,
        Duration: track.Duration,
        Format: track.Format,
        Position: track.Position,
    }));
}

function getTags(userID) {
    return tagsRepository.getAll(userID).map((tag) => ({
        TagID: tag.TagID,
        Name: tag.Name,
        TrackCount: tag.TrackCount,
    }));
}

function updateTrackMetadata(trackID, userID, metadata) {
    const track = tracksRepository.getById(trackID, userID);

    if (!track) {
        return false;
    }

    return tracksRepository.updateMetadata({
        TrackID: trackID,
        UserID: userID,
        Title: metadata.Title,
        Artist: metadata.Artist,
        Album: metadata.Album,
        AlbumArtist: metadata.AlbumArtist,
        Genre: metadata.Genre,
        TrackNumber: metadata.TrackNumber,
        DiscNumber: metadata.DiscNumber,
    });
}

function getTrackTags(trackID, userID) {
    const track = tracksRepository.getById(trackID, userID);

    if (!track) {
        return null;
    }

    return tagsRepository.getForTrack(trackID, userID);
}

function createTag(userID, name) {
    return tagsRepository.create(userID, name);
}

function removeTag(tagID, userID) {
    return tagsRepository.remove(tagID, userID);
}

function addTagToTrack(trackID, tagID, userID) {
    const track = tracksRepository.getById(trackID, userID);
    const tag = tagsRepository.getById(tagID, userID);

    if (!track || !tag) {
        return false;
    }

    tagsRepository.addToTrack(userID, trackID, tagID);

    return true;
}

function removeTagFromTrack(trackID, tagID, userID) {
    return tagsRepository.removeFromTrack(userID, trackID, tagID);
}

module.exports = {
    getTracks,
    getPlaylists,
    getPlaylistTracks,
    getTags,
    updateTrackMetadata,
    getTrackTags,
    createTag,
    removeTag,
    addTagToTrack,
    removeTagFromTrack,
};
