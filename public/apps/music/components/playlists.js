export function initializePlaylists({ onTracksChanged }) {
    const playlistForm = document.getElementById("playlistForm");
    const playlistNameInput = document.getElementById("playlistNameInput");
    const playlistStatus = document.getElementById("playlistStatus");
    const playlistList = document.getElementById("playlistList");
    const bulkPlaylistSelect = document.getElementById("bulkPlaylistSelect");

    let playlists = [];
    let selectedPlaylistID = null;
    let playlistTrackIDs = [];

    function showStatus(message) {
        playlistStatus.textContent = message;
        playlistStatus.classList.remove("hide");
    }

    function clearStatus() {
        playlistStatus.classList.add("hide");
    }

    function renderBulkOptions() {
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
            onTracksChanged();
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
                    showStatus(error.message);
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
                    onTracksChanged();
                } catch (error) {
                    showStatus(error.message);
                }
            });

            item.append(selectButton, count, renameButton, deleteButton);
            playlistList.appendChild(item);
        }

        renderBulkOptions();
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
            onTracksChanged();
        } catch (error) {
            showStatus(error.message);
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

            onTracksChanged();
        } catch (error) {
            showStatus(error.message);
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
            clearStatus();

            await loadPlaylists();
            await selectPlaylist(result.PlaylistID);
        } catch (error) {
            showStatus(error.message);
        }
    });

    return {
        loadPlaylists,
        selectPlaylist,
        refreshPlaylistData,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        getPlaylists: () => playlists,
        getSelectedPlaylistID: () => selectedPlaylistID,
        getPlaylistTrackIDs: () => playlistTrackIDs,
        showStatus,
    };
}
