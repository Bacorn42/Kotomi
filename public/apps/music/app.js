import { initializeKotomiApp } from "/js/kotomi.js";

initializeKotomiApp("music");

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

let isUploading = false;
let tracks = [];
let sortDescending = true;

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

function formatDuration(seconds) {
    if (!Number.isFinite(seconds)) {
        return "--:--";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function formatFileSize(bytes) {
    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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

    const search = searchInput.value.trim().toLowerCase();
    const sortBy = sortSelect.value;

    const filteredTracks = tracks.filter((track) => {
        const searchableText = [track.Title, track.Artist, track.Album]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        return searchableText.includes(search);
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

    libraryEmpty.classList.toggle("hide", tracks.length > 0);

    if (tracks.length > 0 && filteredTracks.length === 0) {
        const empty = document.createElement("div");
        empty.className = "music-search-empty";
        empty.textContent = "No tracks match your search.";
        trackList.appendChild(empty);
    }

    for (const track of filteredTracks) {
        const row = document.createElement("div");
        row.className = "music-track";

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

        row.append(artwork, details, album, duration, editButton);
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

loadTracks();
