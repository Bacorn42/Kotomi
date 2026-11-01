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

let isUploading = false;

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

function renderTracks(tracks) {
    trackList.replaceChildren();

    libraryEmpty.classList.toggle("hide", tracks.length > 0);

    for (const track of tracks) {
        const row = document.createElement("div");
        row.className = "music-track";

        const artwork = document.createElement("div");
        artwork.className = "music-track-artwork";
        artwork.textContent = "♫";

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

        row.append(artwork, details, album, duration);
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

        renderTracks(data.tracks);
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

loadTracks();
