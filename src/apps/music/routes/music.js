const express = require("express");
const multer = require("multer");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

const { requireLogin } = require("../../../middleware/auth");
const { ensureMusicDirectories } = require("../config/storage");
const libraryService = require("../services/library");
const { STAGING_DIRECTORY, ARTWORK_DIRECTORY } = require("../config/storage");
const ingestionService = require("../services/ingestion");
const tracksRepository = require("../repositories/tracks");

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

router.put("/tracks/:trackID", (req, res) => {
    const trackID = Number(req.params.trackID);

    if (!Number.isSafeInteger(trackID) || trackID <= 0) {
        return res.status(400).json({
            message: "Invalid track ID.",
        });
    }

    const body = req.body;

    if (!body || typeof body.Title !== "string" || !body.Title.trim()) {
        return res.status(400).json({
            message: "Track title is required.",
        });
    }

    const stringFields = ["Artist", "Album", "AlbumArtist", "Genre"];

    for (const field of stringFields) {
        if (body[field] !== undefined && body[field] !== null && typeof body[field] !== "string") {
            return res.status(400).json({
                message: `Invalid ${field} value.`,
            });
        }
    }

    const numberFields = ["TrackNumber", "DiscNumber"];

    for (const field of numberFields) {
        const value = body[field];

        if (
            value !== undefined &&
            value !== null &&
            value !== "" &&
            (!Number.isSafeInteger(value) || value <= 0)
        ) {
            return res.status(400).json({
                message: `Invalid ${field} value.`,
            });
        }
    }

    const metadata = {
        Title: body.Title.trim(),
        Artist: body.Artist?.trim() || null,
        Album: body.Album?.trim() || null,
        AlbumArtist: body.AlbumArtist?.trim() || null,
        Genre: body.Genre?.trim() || null,
        TrackNumber: body.TrackNumber ? body.TrackNumber : null,
        DiscNumber: body.DiscNumber ? body.DiscNumber : null,
    };

    const updated = libraryService.updateTrackMetadata(trackID, req.user.UserID, metadata);

    if (!updated) {
        return res.status(404).json({
            message: "Track not found.",
        });
    }

    res.json({
        message: "Track metadata updated.",
    });
});

router.get("/tracks/:trackID/artwork", (req, res) => {
    const trackID = Number(req.params.trackID);

    if (!Number.isSafeInteger(trackID) || trackID <= 0) {
        return res.status(400).json({
            message: "Invalid track ID.",
        });
    }

    const track = tracksRepository.getById(trackID, req.user.UserID);

    if (!track || !track.ArtworkStorageKey) {
        return res.status(404).end();
    }

    const filename = path.basename(track.ArtworkStorageKey);
    const artworkPath = path.resolve(ARTWORK_DIRECTORY, filename);
    const artworkDirectory = path.resolve(ARTWORK_DIRECTORY);

    if (!artworkPath.startsWith(`${artworkDirectory}${path.sep}`)) {
        return res.status(404).end();
    }

    const mimeTypes = {
        ".jpg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".gif": "image/gif",
    };

    const mimeType = mimeTypes[path.extname(filename).toLowerCase()];

    if (!mimeType) {
        return res.status(404).end();
    }

    res.setHeader("Content-Type", mimeType);
    res.setHeader("Cache-Control", "private, max-age=86400");
    res.setHeader("X-Content-Type-Options", "nosniff");

    const stream = fs.createReadStream(artworkPath);

    stream.on("error", () => {
        if (!res.headersSent) {
            res.status(404).end();
        } else {
            res.destroy();
        }
    });

    stream.pipe(res);
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

router.post("/playlists", (req, res) => {
    const name = req.body?.Name;
    const description = req.body?.Description;

    if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
            message: "Playlist name is required.",
        });
    }

    if (name.trim().length > 100) {
        return res.status(400).json({
            message: "Playlist names cannot exceed 100 characters.",
        });
    }

    if (description !== undefined && description !== null && typeof description !== "string") {
        return res.status(400).json({
            message: "Invalid playlist description.",
        });
    }

    if (description && description.length > 500) {
        return res.status(400).json({
            message: "Playlist descriptions cannot exceed 500 characters.",
        });
    }

    const playlistID = libraryService.createPlaylist(
        req.user.UserID,
        name.trim(),
        description?.trim() || null,
    );

    res.status(201).json({
        PlaylistID: playlistID,
        Name: name.trim(),
        Description: description?.trim() || null,
    });
});

router.put("/playlists/:playlistID", (req, res) => {
    const playlistID = Number(req.params.playlistID);
    const name = req.body?.Name;
    const description = req.body?.Description;

    if (!Number.isSafeInteger(playlistID) || playlistID <= 0) {
        return res.status(400).json({
            message: "Invalid playlist ID.",
        });
    }

    if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
            message: "Playlist name is required.",
        });
    }

    if (name.trim().length > 100) {
        return res.status(400).json({
            message: "Playlist names cannot exceed 100 characters.",
        });
    }

    if (description !== undefined && description !== null && typeof description !== "string") {
        return res.status(400).json({
            message: "Invalid playlist description.",
        });
    }

    if (description && description.length > 500) {
        return res.status(400).json({
            message: "Playlist descriptions cannot exceed 500 characters.",
        });
    }

    const updated = libraryService.updatePlaylist(
        playlistID,
        req.user.UserID,
        name.trim(),
        description?.trim() || null,
    );

    if (!updated) {
        return res.status(404).json({
            message: "Playlist not found.",
        });
    }

    res.json({
        message: "Playlist updated.",
    });
});

router.delete("/playlists/:playlistID", (req, res) => {
    const playlistID = Number(req.params.playlistID);

    if (!Number.isSafeInteger(playlistID) || playlistID <= 0) {
        return res.status(400).json({
            message: "Invalid playlist ID.",
        });
    }

    const removed = libraryService.removePlaylist(playlistID, req.user.UserID);

    if (!removed) {
        return res.status(404).json({
            message: "Playlist not found.",
        });
    }

    res.json({
        message: "Playlist deleted.",
    });
});

router.post("/playlists/:playlistID/tracks/:trackID", (req, res) => {
    const playlistID = Number(req.params.playlistID);
    const trackID = Number(req.params.trackID);

    if (
        !Number.isSafeInteger(playlistID) ||
        playlistID <= 0 ||
        !Number.isSafeInteger(trackID) ||
        trackID <= 0
    ) {
        return res.status(400).json({
            message: "Invalid playlist or track ID.",
        });
    }

    const added = libraryService.addTrackToPlaylist(playlistID, trackID, req.user.UserID);

    if (added === null) {
        return res.status(404).json({
            message: "Playlist or track not found.",
        });
    }

    res.json({
        message: added ? "Track added to playlist." : "Track is already in playlist.",
        added,
    });
});

router.delete("/playlists/:playlistID/tracks/:trackID", (req, res) => {
    const playlistID = Number(req.params.playlistID);
    const trackID = Number(req.params.trackID);

    if (
        !Number.isSafeInteger(playlistID) ||
        playlistID <= 0 ||
        !Number.isSafeInteger(trackID) ||
        trackID <= 0
    ) {
        return res.status(400).json({
            message: "Invalid playlist or track ID.",
        });
    }

    const removed = libraryService.removeTrackFromPlaylist(playlistID, trackID, req.user.UserID);

    if (removed === null) {
        return res.status(404).json({
            message: "Playlist not found.",
        });
    }

    if (!removed) {
        return res.status(404).json({
            message: "Track is not in this playlist.",
        });
    }

    res.json({
        message: "Track removed from playlist.",
    });
});

router.get("/tags", (req, res) => {
    const tags = libraryService.getTags(req.user.UserID);

    res.json({ tags });
});

router.get("/tracks/:trackID/tags", (req, res) => {
    const trackID = Number(req.params.trackID);

    if (!Number.isSafeInteger(trackID) || trackID <= 0) {
        return res.status(400).json({
            message: "Invalid track ID.",
        });
    }

    const tags = libraryService.getTrackTags(trackID, req.user.UserID);

    if (tags === null) {
        return res.status(404).json({
            message: "Track not found.",
        });
    }

    res.json({ tags });
});

router.post("/tags", (req, res) => {
    const name = req.body?.Name;

    if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
            message: "Tag name is required.",
        });
    }

    if (name.trim().length > 50) {
        return res.status(400).json({
            message: "Tag names cannot exceed 50 characters.",
        });
    }

    try {
        const tagID = libraryService.createTag(req.user.UserID, name.trim());

        res.status(201).json({
            TagID: tagID,
            Name: name.trim(),
        });
    } catch (error) {
        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return res.status(409).json({
                message: "You already have a tag with that name.",
            });
        }

        throw error;
    }
});

router.delete("/tags/:tagID", (req, res) => {
    const tagID = Number(req.params.tagID);

    if (!Number.isSafeInteger(tagID) || tagID <= 0) {
        return res.status(400).json({
            message: "Invalid tag ID.",
        });
    }

    const removed = libraryService.removeTag(tagID, req.user.UserID);

    if (!removed) {
        return res.status(404).json({
            message: "Tag not found.",
        });
    }

    res.json({
        message: "Tag deleted.",
    });
});

router.post("/tracks/:trackID/tags/:tagID", (req, res) => {
    const trackID = Number(req.params.trackID);
    const tagID = Number(req.params.tagID);

    if (
        !Number.isSafeInteger(trackID) ||
        trackID <= 0 ||
        !Number.isSafeInteger(tagID) ||
        tagID <= 0
    ) {
        return res.status(400).json({
            message: "Invalid track or tag ID.",
        });
    }

    const added = libraryService.addTagToTrack(trackID, tagID, req.user.UserID);

    if (!added) {
        return res.status(404).json({
            message: "Track or tag not found.",
        });
    }

    res.json({
        message: "Tag assigned.",
    });
});

router.delete("/tracks/:trackID/tags/:tagID", (req, res) => {
    const trackID = Number(req.params.trackID);
    const tagID = Number(req.params.tagID);

    if (
        !Number.isSafeInteger(trackID) ||
        trackID <= 0 ||
        !Number.isSafeInteger(tagID) ||
        tagID <= 0
    ) {
        return res.status(400).json({
            message: "Invalid track or tag ID.",
        });
    }

    const removed = libraryService.removeTagFromTrack(trackID, tagID, req.user.UserID);

    if (!removed) {
        return res.status(404).json({
            message: "Tag assignment not found.",
        });
    }

    res.json({
        message: "Tag removed.",
    });
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
