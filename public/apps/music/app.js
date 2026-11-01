import { initializeKotomiApp } from "/js/kotomi.js";
import { initializeMusicPlayer } from "./components/player.js";
import { initializeTags } from "./components/tags.js";
import { initializePlaylists } from "./components/playlists.js";
import { initializeTrackList } from "./components/track-list.js";

initializeKotomiApp("music");

const musicPlayer = initializeMusicPlayer();

const uploadButton = document.getElementById("uploadButton");
const fileInput = document.getElementById("fileInput");
const dropZone = document.getElementById("dropZone");

const uploadProgress = document.getElementById("uploadProgress");
const uploadStatus = document.getElementById("uploadStatus");
const uploadPercentage = document.getElementById("uploadPercentage");
const uploadProgressBar = document.getElementById("uploadProgressBar");
const uploadResults = document.getElementById("uploadResults");

const libraryEmpty = document.getElementById("libraryEmpty");

const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const sortDirectionButton = document.getElementById("sortDirectionButton");

const libraryHeading = document.getElementById("libraryHeading");

const bulkToolbar = document.getElementById("bulkToolbar");
const bulkPlaylistSelect = document.getElementById("bulkPlaylistSelect");
const addBulkPlaylistButton = document.getElementById("addBulkPlaylistButton");
const selectedTrackCount = document.getElementById("selectedTrackCount");
const applyBulkTagButton = document.getElementById("applyBulkTagButton");
const removeBulkTagButton = document.getElementById("removeBulkTagButton");
const clearSelectionButton = document.getElementById("clearSelectionButton");

let isUploading = false;

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

uploadButton.addEventListener("click", () => {
    if (!isUploading) {
        fileInput.click();
    }
});

fileInput.addEventListener("change", () => {
    uploadFiles(Array.from(fileInput.files));
    fileInput.value = "";
});

dropZone.addEventListener("dragover", (event) => {
    event.preventDefault();

    if (!isUploading) {
        dropZone.classList.add("drag-over");
    }
});

dropZone.addEventListener("dragleave", (event) => {
    if (!dropZone.contains(event.relatedTarget)) {
        dropZone.classList.remove("drag-over");
    }
});

dropZone.addEventListener("drop", (event) => {
    event.preventDefault();
    dropZone.classList.remove("drag-over");

    if (!isUploading) {
        uploadFiles(Array.from(event.dataTransfer.files));
    }
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

function showUploadResults(data) {
    uploadResults.replaceChildren();
    uploadResults.classList.remove("hide");

    if (data.uploaded.length > 0) {
        const success = document.createElement("p");
        success.className = "music-upload-success";
        success.textContent = `Successfully imported ${data.uploaded.length} track(s).`;
        uploadResults.appendChild(success);
    }

    for (const failure of data.failed) {
        const error = document.createElement("p");
        error.className = "music-upload-error";
        error.textContent = `${failure.filename}: ${failure.message}`;
        uploadResults.appendChild(error);
    }
}

function uploadFiles(files) {
    if (files.length === 0) {
        return;
    }

    if (files.length > 20) {
        uploadResults.textContent = "You can upload a maximum of 20 files at once.";
        uploadResults.classList.remove("hide");
        return;
    }

    const invalidFiles = files.filter((file) => !file.name.toLowerCase().endsWith(".mp3"));

    if (invalidFiles.length > 0) {
        uploadResults.textContent = "Only MP3 files are supported.";
        uploadResults.classList.remove("hide");
        return;
    }

    const oversizedFiles = files.filter((file) => file.size > 100 * 1024 * 1024);

    if (oversizedFiles.length > 0) {
        uploadResults.textContent = "One or more files exceed the 100 MB limit.";
        uploadResults.classList.remove("hide");
        return;
    }

    const formData = new FormData();

    for (const file of files) {
        formData.append("files", file);
    }

    isUploading = true;
    uploadButton.disabled = true;
    uploadButton.textContent = "Uploading...";

    uploadResults.replaceChildren();
    uploadResults.classList.add("hide");

    uploadProgress.classList.remove("hide");
    uploadStatus.textContent = `Uploading ${files.length} file(s)...`;
    uploadPercentage.textContent = "0%";
    uploadProgressBar.value = 0;

    const xhr = new XMLHttpRequest();

    xhr.open("POST", "/api/music/tracks/upload");

    xhr.upload.addEventListener("progress", (event) => {
        if (!event.lengthComputable) {
            return;
        }

        const percentage = Math.round((event.loaded / event.total) * 100);

        uploadProgressBar.value = percentage;
        uploadPercentage.textContent = `${percentage}%`;
    });

    xhr.addEventListener("load", async () => {
        isUploading = false;
        uploadButton.disabled = false;
        uploadButton.textContent = "+ Add Music";

        uploadProgress.classList.add("hide");

        let data;

        try {
            data = JSON.parse(xhr.responseText);
        } catch {
            uploadResults.textContent = "The server returned an invalid response.";
            uploadResults.classList.remove("hide");
            return;
        }

        if (!xhr.status || xhr.status >= 400) {
            uploadResults.textContent = data.message || "Upload failed.";
            uploadResults.classList.remove("hide");
            return;
        }

        showUploadResults(data);
        await loadTracks();
    });

    xhr.addEventListener("error", () => {
        isUploading = false;
        uploadButton.disabled = false;
        uploadButton.textContent = "+ Add Music";

        uploadProgress.classList.add("hide");
        uploadResults.textContent = "A network error occurred during upload.";
        uploadResults.classList.remove("hide");
    });

    xhr.send(formData);
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
