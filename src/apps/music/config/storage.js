const fs = require("fs");
const path = require("path");

const MUSIC_DIRECTORY = path.join(process.cwd(), "data", "music");

const LIBRARY_DIRECTORY = path.join(MUSIC_DIRECTORY, "library");
const ARTWORK_DIRECTORY = path.join(MUSIC_DIRECTORY, "artwork");
const STAGING_DIRECTORY = path.join(MUSIC_DIRECTORY, "staging");

function ensureMusicDirectories() {
    const directories = [LIBRARY_DIRECTORY, ARTWORK_DIRECTORY, STAGING_DIRECTORY];

    for (const directory of directories) {
        fs.mkdirSync(directory, { recursive: true });
    }
}

module.exports = {
    MUSIC_DIRECTORY,
    LIBRARY_DIRECTORY,
    ARTWORK_DIRECTORY,
    STAGING_DIRECTORY,
    ensureMusicDirectories,
};
