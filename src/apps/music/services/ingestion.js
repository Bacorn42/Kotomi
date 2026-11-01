const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const tracksRepository = require("../repositories/tracks");

const { LIBRARY_DIRECTORY, ARTWORK_DIRECTORY } = require("../config/storage");

const artworkExtensions = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
};

function getPositiveInteger(value) {
    return Number.isInteger(value) && value > 0 ? value : null;
}

async function calculateFileHash(filePath) {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash("sha256");
        const stream = fs.createReadStream(filePath);

        stream.on("data", (chunk) => hash.update(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(hash.digest("hex")));
    });
}

async function importTrack(file, userID) {
    let storageKey = null;
    let artworkStorageKey = null;

    try {
        const { parseFile } = await import("music-metadata");
        const metadata = await parseFile(file.path, { duration: true });

        if (metadata.format.container !== "MPEG" || !metadata.format.codec?.includes("Layer 3")) {
            throw new Error("The file does not appear to be a valid MP3.");
        }

        const fileStats = await fs.promises.stat(file.path);
        const common = metadata.common;

        const originalFilename = path.basename(file.originalname.replace(/\\/g, "/"));

        const title =
            common.title?.trim() || path.basename(originalFilename, path.extname(originalFilename));

        const fileHash = await calculateFileHash(file.path);

        const picture = common.picture?.[0];

        if (picture && artworkExtensions[picture.format]) {
            artworkStorageKey = `${crypto.randomUUID()}.${artworkExtensions[picture.format]}`;

            await fs.promises.writeFile(
                path.join(ARTWORK_DIRECTORY, artworkStorageKey),
                picture.data,
            );
        }

        storageKey = `${crypto.randomUUID()}.mp3`;

        await fs.promises.rename(file.path, path.join(LIBRARY_DIRECTORY, storageKey));

        const trackID = tracksRepository.create({
            UserID: userID,
            StorageKey: storageKey,
            OriginalFilename: originalFilename,
            Title: title,
            Artist: common.artist || null,
            Album: common.album || null,
            AlbumArtist: common.albumartist || null,
            Genre: common.genre?.join(", ") || null,
            Duration: Number.isFinite(metadata.format.duration) ? metadata.format.duration : null,
            FileSize: fileStats.size,
            Format: "mp3",
            MimeType: "audio/mpeg",
            TrackNumber: getPositiveInteger(common.track?.no),
            DiscNumber: getPositiveInteger(common.disk?.no),
            FileHash: fileHash,
            ArtworkStorageKey: artworkStorageKey,
        });

        return {
            TrackID: trackID,
            Title: title,
            Artist: common.artist || null,
            Album: common.album || null,
            Duration: Number.isFinite(metadata.format.duration) ? metadata.format.duration : null,
            FileSize: fileStats.size,
            Format: "mp3",
        };
    } catch (error) {
        if (storageKey) {
            await fs.promises.unlink(path.join(LIBRARY_DIRECTORY, storageKey)).catch(() => {});
        }

        if (artworkStorageKey) {
            await fs.promises
                .unlink(path.join(ARTWORK_DIRECTORY, artworkStorageKey))
                .catch(() => {});
        }

        throw error;
    } finally {
        await fs.promises.unlink(file.path).catch(() => {});
    }
}

module.exports = {
    importTrack,
};
