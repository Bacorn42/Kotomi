const express = require("express");
const multer = require("multer");
const crypto = require("crypto");
const path = require("path");

const { requireLogin } = require("../../../middleware/auth");
const { ensureMusicDirectories } = require("../config/storage");
const libraryService = require("../services/library");
const { STAGING_DIRECTORY } = require("../config/storage");
const ingestionService = require("../services/ingestion");

const router = express.Router();

const upload = multer({
    storage: multer.diskStorage({
        destination: STAGING_DIRECTORY,
        filename: (req, file, callback) => {
            callback(null, `${crypto.randomUUID()}.upload`);
        },
    }),
    limits: {
        fileSize: 100 * 1024 * 1024,
        files: 20,
    },
    fileFilter: (req, file, callback) => {
        if (path.extname(file.originalname).toLowerCase() !== ".mp3") {
            return callback(new Error("Only MP3 files are supported."));
        }

        callback(null, true);
    },
});

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

router.post(
    "/tracks/upload",
    (req, res, next) => {
        upload.array("files", 20)(req, res, (error) => {
            if (error) {
                const status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;

                return res.status(status).json({
                    message:
                        error.code === "LIMIT_FILE_SIZE"
                            ? "A file exceeds the 100 MB upload limit."
                            : error.message,
                });
            }

            next();
        });
    },
    async (req, res) => {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                message: "No files were uploaded.",
            });
        }

        const uploaded = [];
        const failed = [];

        for (const file of req.files) {
            try {
                const track = await ingestionService.importTrack(file, req.user.UserID);

                uploaded.push(track);
            } catch (error) {
                failed.push({
                    filename: file.originalname,
                    message: error.message,
                });
            }
        }

        res.status(uploaded.length > 0 ? 201 : 400).json({
            uploaded,
            failed,
        });
    },
);

module.exports = router;
