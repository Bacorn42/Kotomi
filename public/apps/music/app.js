import { initializeKotomiApp } from "/js/kotomi.js";
import { initializeMusicPlayer } from "./components/player.js";
import { initializeTags } from "./components/tags.js";
import { initializePlaylists } from "./components/playlists.js";
import { initializeTrackList } from "./components/track-list.js";
import { initializeUpload } from "./components/upload.js";
import { initializeLibrary } from "./components/library.js";

initializeKotomiApp("music");

const musicPlayer = initializeMusicPlayer();

const bulkToolbar = document.getElementById("bulkToolbar");
const bulkTagSelect = document.getElementById("bulkTagSelect");
const bulkPlaylistSelect = document.getElementById("bulkPlaylistSelect");
const addBulkPlaylistButton = document.getElementById("addBulkPlaylistButton");
const selectedTrackCount = document.getElementById("selectedTrackCount");
const applyBulkTagButton = document.getElementById("applyBulkTagButton");
const removeBulkTagButton = document.getElementById("removeBulkTagButton");
const clearSelectionButton = document.getElementById("clearSelectionButton");

let selectedTrackIDs = new Set();

const tags = initializeTags({
    onTracksChanged: () => library.render(),
    onBulkOptionsChanged: updateBulkToolbar,
});

const playlists = initializePlaylists({
    onTracksChanged: () => library.render(),
});

const trackList = initializeTrackList({
    tags,
    playlists,
    musicPlayer,
    onTracksChanged: () => library.loadTracks(),
    onSelectionChanged: updateBulkToolbar,
});

const library = initializeLibrary({
    tags,
    playlists,
    trackList,
    getSelectedTrackIDs: () => selectedTrackIDs,
    onVisibleTracksChanged: updateBulkToolbar,
});

initializeUpload({
    onUploadComplete: () => library.loadTracks(),
});

function updateBulkToolbar() {
    const selectedCount = selectedTrackIDs.size;
    const allVisibleSelected =
        library.getVisibleTrackIDs.length > 0 &&
        library.getVisibleTrackIDs.every((trackID) => selectedTrackIDs.has(trackID));

    bulkToolbar.classList.toggle(
        "hide",
        library.getVisibleTrackIDs.length === 0 && selectedTrackIDs.size === 0,
    );

    selectedTrackCount.textContent = `${selectedCount} selected`;

    bulkTagSelect.disabled = selectedCount === 0 || tags.getTags().length === 0;
    applyBulkTagButton.disabled = selectedCount === 0 || !bulkTagSelect.value;
    removeBulkTagButton.disabled = selectedCount === 0 || !bulkTagSelect.value;
    clearSelectionButton.disabled = selectedCount === 0;

    const selectVisibleButton = document.getElementById("selectVisibleButton");

    if (selectVisibleButton) {
        selectVisibleButton.textContent = allVisibleSelected
            ? "Deselect visible"
            : "Select visible";
    }
}

async function applyBulkTag(method) {
    const tagID = Number(bulkTagSelect.value);

    if (!tagID || selectedTrackIDs.size === 0) {
        return;
    }

    applyBulkTagButton.disabled = true;
    removeBulkTagButton.disabled = true;

    const selectedIDs = [...selectedTrackIDs];
    const failed = [];

    for (const trackID of selectedIDs) {
        try {
            const response = await fetch(`/api/music/tracks/${trackID}/tags/${tagID}`, { method });

            if (!response.ok) {
                throw new Error("Request failed.");
            }
        } catch {
            failed.push(trackID);
        }
    }

    if (failed.length > 0) {
        tags.showStatus(`Could not update ${failed.length} of ${selectedIDs.length} track(s).`);
    } else {
        tags.clearStatus();
    }

    selectedTrackIDs.clear();

    await tags.loadTags();
    await library.loadTracks();
}

document.getElementById("selectVisibleButton").addEventListener("click", () => {
    const visibleTrackIDs = library.getVisibleTrackIDs();

    const allSelected =
        visibleTrackIDs.length > 0 &&
        visibleTrackIDs.every((trackID) => selectedTrackIDs.has(trackID));

    for (const trackID of visibleTrackIDs) {
        if (allSelected) {
            selectedTrackIDs.delete(trackID);
        } else {
            selectedTrackIDs.add(trackID);
        }
    }

    library.render();
});

applyBulkTagButton.addEventListener("click", () => {
    applyBulkTag("POST");
});

removeBulkTagButton.addEventListener("click", () => {
    applyBulkTag("DELETE");
});

clearSelectionButton.addEventListener("click", () => {
    selectedTrackIDs.clear();
    library.render();
});

bulkTagSelect.addEventListener("change", updateBulkToolbar);

addBulkPlaylistButton.addEventListener("click", async () => {
    const playlistID = Number(bulkPlaylistSelect.value);

    if (!playlistID || selectedTrackIDs.size === 0) {
        return;
    }

    try {
        let addedCount = 0;

        for (const trackID of selectedTrackIDs) {
            const added = await playlists.addTrackToPlaylist(playlistID, trackID);

            if (added) {
                addedCount++;
            }
        }

        await playlists.refreshPlaylistData();

        playlists.showStatus(
            `Added ${addedCount} track${addedCount === 1 ? "" : "s"} to playlist.`,
        );
    } catch (error) {
        playlists.showStatus(error.message);
    }
});

playlists.loadPlaylists();
tags.loadTags();
library.loadTracks();
