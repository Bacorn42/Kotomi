const express = require("express");

const { requireLogin } = require("../../../middleware/auth");
const { ensureMusicDirectories } = require("../config/storage");
const libraryService = require("../services/library");

const router = express.Router();

ensureMusicDirectories();

router.use(requireLogin);

router.get("/status", (req, res) => {
    res.json({
        message: "Music API is working.",
    });
});

router.get("/tracks", (req, res) => {
    const tracks = libraryService.getTracks(req.user.UserID);

    res.json({ tracks });
});

router.get("/playlists", (req, res) => {
    const playlists = libraryService.getPlaylists(req.user.UserID);

    res.json({ playlists });
});

router.get("/playlists/:playlistID/tracks", (req, res) => {
    const playlistID = Number(req.params.playlistID);

    if (!Number.isSafeInteger(playlistID) || playlistID <= 0) {
        return res.status(400).json({
            message: "Invalid playlist ID.",
        });
    }

    const tracks = libraryService.getPlaylistTracks(playlistID, req.user.UserID);

    if (tracks === null) {
        return res.status(404).json({
            message: "Playlist not found.",
        });
    }

    res.json({ tracks });
});

router.get("/tags", (req, res) => {
    const tags = libraryService.getTags(req.user.UserID);

    res.json({ tags });
});

module.exports = router;
