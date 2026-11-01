import { initializeKotomiApp } from "/js/kotomi.js";
import { initializeMusicPlayer } from "./components/player.js";
import { formatDuration } from "./utils/formatting.js";
import { initializeTags } from "./components/tags.js";

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

const trackList = document.getElementById("trackList");
const libraryEmpty = document.getElementById("libraryEmpty");

const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const sortDirectionButton = document.getElementById("sortDirectionButton");

const playlistForm = document.getElementById("playlistForm");
const playlistNameInput = document.getElementById("playlistNameInput");
const playlistStatus = document.getElementById("playlistStatus");
const playlistList = document.getElementById("playlistList");
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

let playlists = [];
let selectedPlaylistID = null;
let playlistTrackIDs = [];

const tags = initializeTags({
    onTracksChanged: renderTracks,
    onBulkOptionsChanged: updateBulkToolbar,
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

function showPlaylistStatus(message) {
    playlistStatus.textContent = message;
    playlistStatus.classList.remove("hide");
}

function renderPlaylists() {
    playlistList.replaceChildren();

    const allTracksItem = document.createElement("div");
    allTracksItem.className = "music-playlist-item";

    if (selectedPlaylistID === null) {
        allTracksItem.classList.add("active");
    }

    const allTracksButton = document.createElement("button");
    allTracksButton.type = "button";
    allTracksButton.className = "music-playlist-filter";
    allTracksButton.textContent = "All tracks";

    allTracksButton.addEventListener("click", () => {
        selectedPlaylistID = null;
        playlistTrackIDs = [];
        renderPlaylists();
        renderTracks();
    });

    allTracksItem.appendChild(allTracksButton);
    playlistList.appendChild(allTracksItem);

    for (const playlist of playlists) {
        const item = document.createElement("div");
        item.className = "music-playlist-item";

        if (selectedPlaylistID === playlist.PlaylistID) {
            item.classList.add("active");
        }

        const selectButton = document.createElement("button");
        selectButton.type = "button";
        selectButton.className = "music-playlist-filter";
        selectButton.textContent = playlist.Name;

        selectButton.addEventListener("click", () => {
            selectPlaylist(playlist.PlaylistID);
        });

        const count = document.createElement("span");
        count.className = "music-tag-count";
        count.textContent = playlist.TrackCount;

        const renameButton = document.createElement("button");
        renameButton.type = "button";
        renameButton.className = "music-tag-delete";
        renameButton.textContent = "✎";
        renameButton.title = `Rename ${playlist.Name}`;

        renameButton.addEventListener("click", async () => {
            const name = prompt("Enter a new playlist name:", playlist.Name);

            if (name === null || !name.trim()) {
                return;
            }

            try {
                const response = await fetch(`/api/music/playlists/${playlist.PlaylistID}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        Name: name.trim(),
                        Description: playlist.Description,
                    }),
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || "Failed to rename playlist.");
                }

                await loadPlaylists();
            } catch (error) {
                showPlaylistStatus(error.message);
            }
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "music-tag-delete";
        deleteButton.textContent = "×";
        deleteButton.title = `Delete ${playlist.Name}`;

        deleteButton.addEventListener("click", async () => {
            if (!confirm(`Delete the playlist "${playlist.Name}"?`)) {
                return;
            }

            try {
                const response = await fetch(`/api/music/playlists/${playlist.PlaylistID}`, {
                    method: "DELETE",
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || "Failed to delete playlist.");
                }

                if (selectedPlaylistID === playlist.PlaylistID) {
                    selectedPlaylistID = null;
                    playlistTrackIDs = [];
                }

                await loadPlaylists();
                renderTracks();
            } catch (error) {
                showPlaylistStatus(error.message);
            }
        });

        item.append(selectButton, count, renameButton, deleteButton);
        playlistList.appendChild(item);
    }
    renderBulkPlaylistOptions();
}

async function loadPlaylists() {
    try {
        const response = await fetch("/api/music/playlists");

        if (!response.ok) {
            throw new Error("Failed to load playlists.");
        }

        const data = await response.json();
        playlists = data.playlists;

        if (
            selectedPlaylistID !== null &&
            !playlists.some((playlist) => playlist.PlaylistID === selectedPlaylistID)
        ) {
            selectedPlaylistID = null;
            playlistTrackIDs = [];
        }

        renderPlaylists();
        renderTracks();
    } catch (error) {
        showPlaylistStatus(error.message);
    }
}

async function selectPlaylist(playlistID) {
    selectedPlaylistID = playlistID;
    playlistTrackIDs = [];

    renderPlaylists();

    try {
        const response = await fetch(`/api/music/playlists/${playlistID}/tracks`);

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to load playlist.");
        }

        playlistTrackIDs = data.tracks.map((track) => track.TrackID);

        renderTracks();
    } catch (error) {
        showPlaylistStatus(error.message);
    }
}

playlistForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = playlistNameInput.value.trim();

    if (!name) {
        return;
    }

    try {
        const response = await fetch("/api/music/playlists", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ Name: name }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Failed to create playlist.");
        }

        playlistNameInput.value = "";
        playlistStatus.classList.add("hide");

        await loadPlaylists();
        await selectPlaylist(result.PlaylistID);
    } catch (error) {
        showPlaylistStatus(error.message);
    }
});

function createEditorField(labelText, name, value, type = "text") {
    const field = document.createElement("label");
    field.className = "music-editor-field";

    const label = document.createElement("span");
    label.textContent = labelText;

    const input = document.createElement("input");
    input.className = "kotomi-control";
    input.name = name;
    input.type = type;
    input.value = value ?? "";

    if (type === "number") {
        input.min = "1";
        input.step = "1";
    }

    field.append(label, input);

    return field;
}

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

function renderBulkPlaylistOptions() {
    bulkPlaylistSelect.replaceChildren();

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Choose a playlist...";
    bulkPlaylistSelect.appendChild(placeholder);

    for (const playlist of playlists) {
        const option = document.createElement("option");
        option.value = playlist.PlaylistID;
        option.textContent = playlist.Name;
        bulkPlaylistSelect.appendChild(option);
    }
}

async function refreshPlaylistData() {
    await loadPlaylists();

    if (selectedPlaylistID !== null) {
        await selectPlaylist(selectedPlaylistID);
    }
}

async function addTrackToPlaylist(playlistID, trackID) {
    const response = await fetch(`/api/music/playlists/${playlistID}/tracks/${trackID}`, {
        method: "POST",
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Failed to add track to playlist.");
    }

    return result.added;
}

async function removeTrackFromPlaylist(playlistID, trackID) {
    const response = await fetch(`/api/music/playlists/${playlistID}/tracks/${trackID}`, {
        method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Failed to remove track from playlist.");
    }
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
            const added = await addTrackToPlaylist(playlistID, trackID);

            if (added) {
                addedCount++;
            }
        }

        await refreshPlaylistData();

        showPlaylistStatus(`Added ${addedCount} track${addedCount === 1 ? "" : "s"} to playlist.`);
    } catch (error) {
        showPlaylistStatus(error.message);
    }
});

function createTrackEditor(track) {
    const editor = document.createElement("form");
    editor.className = "music-track-editor";

    const heading = document.createElement("h3");
    heading.textContent = "Edit track";

    const fields = [
        createEditorField("Title", "Title", track.Title),
        createEditorField("Artist", "Artist", track.Artist),
        createEditorField("Album", "Album", track.Album),
        createEditorField("Album artist", "AlbumArtist", track.AlbumArtist),
        createEditorField("Genre", "Genre", track.Genre),
        createEditorField("Track number", "TrackNumber", track.TrackNumber, "number"),
        createEditorField("Disc number", "DiscNumber", track.DiscNumber, "number"),
    ];

    const actions = document.createElement("div");
    actions.className = "music-editor-actions";

    const saveButton = document.createElement("button");
    saveButton.type = "submit";
    saveButton.className = "kotomi-button";
    saveButton.textContent = "Save";

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.className = "kotomi-button-secondary";
    cancelButton.textContent = "Cancel";

    const status = document.createElement("p");
    status.className = "music-editor-status hide";

    actions.append(saveButton, cancelButton);
    editor.append(heading, ...fields, actions, status);

    cancelButton.addEventListener("click", () => {
        editor.remove();
    });

    editor.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(editor);

        const metadata = {
            Title: formData.get("Title"),
            Artist: formData.get("Artist"),
            Album: formData.get("Album"),
            AlbumArtist: formData.get("AlbumArtist"),
            Genre: formData.get("Genre"),
            TrackNumber: formData.get("TrackNumber") ? Number(formData.get("TrackNumber")) : null,
            DiscNumber: formData.get("DiscNumber") ? Number(formData.get("DiscNumber")) : null,
        };

        saveButton.disabled = true;
        saveButton.textContent = "Saving...";

        try {
            const response = await fetch(`/api/music/tracks/${track.TrackID}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(metadata),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to update track.");
            }

            await loadTracks();
            await tags.loadTags();
        } catch (error) {
            status.textContent = error.message;
            status.classList.remove("hide");
            saveButton.disabled = false;
            saveButton.textContent = "Save";
        }
    });

    return editor;
}

function renderTracks() {
    trackList.replaceChildren();

    const sourceTracks =
        selectedPlaylistID === null
            ? tracks
            : playlistTrackIDs
                  .map((trackID) => tracks.find((track) => track.TrackID === trackID))
                  .filter(Boolean);

    const selectedPlaylist = playlists.find(
        (playlist) => playlist.PlaylistID === selectedPlaylistID,
    );

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

    libraryEmpty.classList.toggle("hide", tracks.length > 0 || selectedPlaylistID !== null);

    if (filteredTracks.length === 0 && (tracks.length > 0 || selectedPlaylistID !== null)) {
        const empty = document.createElement("div");
        empty.className = "music-search-empty";

        if (selectedPlaylistID !== null && playlistTrackIDs.length === 0) {
            empty.textContent = "This playlist is empty. Add some tracks to get started.";
        } else {
            empty.textContent = "No tracks match your search.";
        }

        trackList.appendChild(empty);
    }

    for (const track of filteredTracks) {
        const row = document.createElement("div");
        row.className = "music-track";

        const selection = document.createElement("input");
        selection.type = "checkbox";
        selection.className = "music-track-selection";
        selection.checked = selectedTrackIDs.has(track.TrackID);
        selection.title = "Select track";

        selection.addEventListener("change", () => {
            if (selection.checked) {
                selectedTrackIDs.add(track.TrackID);
            } else {
                selectedTrackIDs.delete(track.TrackID);
            }

            updateBulkToolbar();
        });

        const artwork = document.createElement("div");
        artwork.className = "music-track-artwork";

        const placeholder = document.createElement("span");
        placeholder.textContent = "♫";
        artwork.appendChild(placeholder);

        if (track.ArtworkURL) {
            const image = document.createElement("img");

            image.src = track.ArtworkURL;
            image.alt = `${track.Title} artwork`;
            image.loading = "lazy";

            image.addEventListener("load", () => {
                placeholder.classList.add("hide");
            });

            image.addEventListener("error", () => {
                image.remove();
            });

            artwork.appendChild(image);
        }

        const details = document.createElement("div");
        details.className = "music-track-details";

        const title = document.createElement("div");
        title.className = "music-track-title";
        title.textContent = track.Title;

        const artist = document.createElement("div");
        artist.className = "music-track-artist";
        artist.textContent = track.Artist || "Unknown artist";

        details.append(title, artist);

        if (track.Tags.length > 0) {
            const trackTags = document.createElement("div");
            trackTags.className = "music-track-tags";

            for (const tag of track.Tags) {
                const chip = document.createElement("span");
                chip.textContent = tag.Name;
                trackTags.appendChild(chip);
            }

            details.appendChild(trackTags);
        }

        const album = document.createElement("div");
        album.className = "music-track-album";
        album.textContent = track.Album || "Unknown album";

        const duration = document.createElement("div");
        duration.className = "music-track-duration";
        duration.textContent = formatDuration(track.Duration);

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "kotomi-button-secondary music-track-edit";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", () => {
            const existingEditor = row.nextElementSibling;

            if (existingEditor?.classList.contains("music-track-editor")) {
                existingEditor.remove();
                return;
            }

            const editor = createTrackEditor(track);
            row.after(editor);
        });

        const tagsButton = document.createElement("button");
        tagsButton.type = "button";
        tagsButton.className = "kotomi-button-secondary music-track-edit";
        tagsButton.textContent = "Tags";

        tagsButton.addEventListener("click", () => {
            const existingEditor = row.nextElementSibling;

            if (existingEditor?.classList.contains("music-track-tags-editor")) {
                existingEditor.remove();
                return;
            }

            const editor = tags.createTrackTagEditor(track);
            row.after(editor);
        });

        let playlistButton;

        if (selectedPlaylistID !== null) {
            playlistButton = document.createElement("button");
            playlistButton.type = "button";
            playlistButton.className = "kotomi-button-secondary music-track-edit";
            playlistButton.textContent = "Remove";

            playlistButton.addEventListener("click", async () => {
                try {
                    await removeTrackFromPlaylist(selectedPlaylistID, track.TrackID);
                    await refreshPlaylistData();
                } catch (error) {
                    showPlaylistStatus(error.message);
                }
            });
        } else {
            playlistButton = document.createElement("button");
            playlistButton.type = "button";
            playlistButton.className = "kotomi-button-secondary music-track-edit";
            playlistButton.textContent = "Playlist";

            playlistButton.addEventListener("click", () => {
                const existingMenu = row.nextElementSibling;

                if (existingMenu?.classList.contains("music-track-playlist-menu")) {
                    existingMenu.remove();
                    return;
                }

                const menu = document.createElement("div");
                menu.className = "music-track-playlist-menu";

                if (playlists.length === 0) {
                    const empty = document.createElement("span");
                    empty.textContent = "Create a playlist first.";
                    menu.appendChild(empty);
                }

                for (const playlist of playlists) {
                    const option = document.createElement("button");
                    option.type = "button";
                    option.className = "kotomi-button-secondary";
                    option.textContent = playlist.Name;

                    option.addEventListener("click", async () => {
                        try {
                            const added = await addTrackToPlaylist(
                                playlist.PlaylistID,
                                track.TrackID,
                            );

                            if (added) {
                                await refreshPlaylistData();
                            } else {
                                menu.remove();
                            }
                        } catch (error) {
                            showPlaylistStatus(error.message);
                        }
                    });

                    menu.appendChild(option);
                }

                row.after(menu);
            });
        }

        const playButton = document.createElement("button");
        playButton.type = "button";
        playButton.className = "kotomi-button-secondary music-track-edit";
        playButton.textContent = "Play";

        playButton.addEventListener("click", () => {
            musicPlayer.playTrack(track, filteredTracks);
        });

        const actions = document.createElement("div");
        actions.className = "music-track-actions";
        actions.append(playButton, playlistButton, tagsButton, editButton);

        row.append(selection, artwork, details, album, duration, actions);
        trackList.appendChild(row);
    }
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

loadPlaylists();
tags.loadTags();
loadTracks();
