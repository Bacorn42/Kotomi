import { initializeKotomiApp } from "/js/kotomi.js";
import { initializeMusicPlayer } from "./components/player.js";
import { initializeTags } from "./components/tags.js";
import { initializePlaylists } from "./components/playlists.js";
import { initializeTrackList } from "./components/track-list.js";
import { initializeUpload } from "./components/upload.js";

initializeKotomiApp("music");

const musicPlayer = initializeMusicPlayer();

const libraryEmpty = document.getElementById("libraryEmpty");

const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const sortDirectionButton = document.getElementById("sortDirectionButton");

const libraryHeading = document.getElementById("libraryHeading");

const bulkToolbar = document.getElementById("bulkToolbar");
const bulkTagSelect = document.getElementById("bulkTagSelect");
const bulkPlaylistSelect = document.getElementById("bulkPlaylistSelect");
const addBulkPlaylistButton = document.getElementById("addBulkPlaylistButton");
const selectedTrackCount = document.getElementById("selectedTrackCount");
const applyBulkTagButton = document.getElementById("applyBulkTagButton");
const removeBulkTagButton = document.getElementById("removeBulkTagButton");
const clearSelectionButton = document.getElementById("clearSelectionButton");

let tracks = [];
let sortDescending = true;

let selectedTrackIDs = new Set();
let visibleTrackIDs = [];

const tags = initializeTags({
    onTracksChanged: renderTracks,
    onBulkOptionsChanged: updateBulkToolbar,
});

const playlists = initializePlaylists({
    onTracksChanged: renderTracks,
});

const trackList = initializeTrackList({
    tags,
    playlists,
    musicPlayer,
    onTracksChanged: loadTracks,
    onSelectionChanged: updateBulkToolbar,
});

initializeUpload({
    onUploadComplete: loadTracks,
});

function updateBulkToolbar() {
    const selectedCount = selectedTrackIDs.size;
    const allVisibleSelected =
        visibleTrackIDs.length > 0 &&
        visibleTrackIDs.every((trackID) => selectedTrackIDs.has(trackID));

    bulkToolbar.classList.toggle(
        "hide",
        visibleTrackIDs.length === 0 && selectedTrackIDs.size === 0,
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
    await loadTracks();
}

document.getElementById("selectVisibleButton").addEventListener("click", () => {
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

    renderTracks();
});

applyBulkTagButton.addEventListener("click", () => {
    applyBulkTag("POST");
});

removeBulkTagButton.addEventListener("click", () => {
    applyBulkTag("DELETE");
});

clearSelectionButton.addEventListener("click", () => {
    selectedTrackIDs.clear();
    renderTracks();
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

function renderTracks() {
    const sourceTracks =
        playlists.getSelectedPlaylistID() === null
            ? tracks
            : playlists
                  .getPlaylistTrackIDs()
                  .map((trackID) => tracks.find((track) => track.TrackID === trackID))
                  .filter(Boolean);

    const selectedPlaylist = playlists
        .getPlaylists()
        .find((playlist) => playlist.PlaylistID === playlists.getSelectedPlaylistID());

    libraryHeading.textContent = selectedPlaylist ? selectedPlaylist.Name : "Music Library";

    const search = searchInput.value.trim().toLowerCase();
    const sortBy = sortSelect.value;

    const filteredTracks = sourceTracks.filter((track) => {
        const searchableText = [track.Title, track.Artist, track.Album]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        const matchesSearch = searchableText.includes(search);

        const matchesTag =
            tags.getSelectedTagID() === null ||
            track.Tags.some((tag) => tag.TagID === tags.getSelectedTagID());

        return matchesSearch && matchesTag;
    });

    filteredTracks.sort((a, b) => {
        let comparison = 0;

        if (sortBy === "added") {
            comparison = new Date(a.AddedDate) - new Date(b.AddedDate);
        } else {
            const valueA = (
                a[sortBy === "title" ? "Title" : sortBy === "artist" ? "Artist" : "Album"] || ""
            ).toLowerCase();
            const valueB = (
                b[sortBy === "title" ? "Title" : sortBy === "artist" ? "Artist" : "Album"] || ""
            ).toLowerCase();

            comparison = valueA.localeCompare(valueB);
        }

        return sortDescending ? -comparison : comparison;
    });

    visibleTrackIDs = filteredTracks.map((track) => track.TrackID);
    updateBulkToolbar();

    libraryEmpty.classList.toggle(
        "hide",
        tracks.length > 0 || playlists.getSelectedPlaylistID() !== null,
    );

    let emptyMessage = null;

    if (
        filteredTracks.length === 0 &&
        (tracks.length > 0 || playlists.getSelectedPlaylistID() !== null)
    ) {
        if (
            playlists.getSelectedPlaylistID() !== null &&
            playlists.getPlaylistTrackIDs().length === 0
        ) {
            emptyMessage = "This playlist is empty. Add some tracks to get started.";
        } else {
            emptyMessage = "No tracks match your search.";
        }
    }

    trackList.render(filteredTracks, selectedTrackIDs, emptyMessage);
}

async function loadTracks() {
    try {
        const response = await fetch("/api/music/tracks");

        if (!response.ok) {
            throw new Error("Failed to load music library.");
        }

        const data = await response.json();

        tracks = data.tracks;
        renderTracks();
    } catch (error) {
        console.error(error);
    }
}

searchInput.addEventListener("input", renderTracks);

sortSelect.addEventListener("change", renderTracks);

sortDirectionButton.addEventListener("click", () => {
    sortDescending = !sortDescending;

    sortDirectionButton.textContent = sortDescending ? "↓" : "↑";

    renderTracks();
});

playlists.loadPlaylists();
tags.loadTags();
loadTracks();
