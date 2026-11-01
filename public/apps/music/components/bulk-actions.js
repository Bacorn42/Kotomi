export function initializeBulkActions({
    tags,
    playlists,
    musicPlayer,
    getVisibleTrackIDs,
    getTracks,
    renderLibrary,
}) {
    const bulkToolbar = document.getElementById("bulkToolbar");
    const bulkTagSelect = document.getElementById("bulkTagSelect");
    const bulkPlaylistSelect = document.getElementById("bulkPlaylistSelect");
    const addBulkPlaylistButton = document.getElementById("addBulkPlaylistButton");
    const selectedTrackCount = document.getElementById("selectedTrackCount");
    const applyBulkTagButton = document.getElementById("applyBulkTagButton");
    const removeBulkTagButton = document.getElementById("removeBulkTagButton");
    const clearSelectionButton = document.getElementById("clearSelectionButton");
    const selectVisibleButton = document.getElementById("selectVisibleButton");

    const selectedTrackIDs = new Set();

    const playSelectionButton = document.createElement("button");
    playSelectionButton.type = "button";
    playSelectionButton.className = "kotomi-button";
    playSelectionButton.textContent = "Play Selection";

    const addToQueueButton = document.createElement("button");
    addToQueueButton.type = "button";
    addToQueueButton.className = "kotomi-button-secondary";
    addToQueueButton.textContent = "Add to Queue";

    const playNextButton = document.createElement("button");
    playNextButton.type = "button";
    playNextButton.className = "kotomi-button-secondary";
    playNextButton.textContent = "Play Next";

    bulkToolbar.append(playSelectionButton, addToQueueButton, playNextButton);

    function getSelectedVisibleTracks() {
        const selectedIDs = selectedTrackIDs;
        const tracksByID = new Map(getTracks().map((track) => [track.TrackID, track]));

        return getVisibleTrackIDs()
            .filter((trackID) => selectedIDs.has(trackID))
            .map((trackID) => tracksByID.get(trackID))
            .filter(Boolean);
    }

    function updateToolbar() {
        const selectedCount = selectedTrackIDs.size;
        const visibleTrackIDs = getVisibleTrackIDs();

        const selectedVisibleCount = getSelectedVisibleTracks().length;

        playSelectionButton.disabled = selectedVisibleCount === 0;
        addToQueueButton.disabled = selectedVisibleCount === 0;
        playNextButton.disabled = selectedVisibleCount === 0;

        const allVisibleSelected =
            visibleTrackIDs.length > 0 &&
            visibleTrackIDs.every((trackID) => selectedTrackIDs.has(trackID));

        bulkToolbar.classList.toggle("hide", visibleTrackIDs.length === 0 && selectedCount === 0);

        selectedTrackCount.textContent = `${selectedCount} selected`;

        bulkTagSelect.disabled = selectedCount === 0 || tags.getTags().length === 0;
        applyBulkTagButton.disabled = selectedCount === 0 || !bulkTagSelect.value;
        removeBulkTagButton.disabled = selectedCount === 0 || !bulkTagSelect.value;
        clearSelectionButton.disabled = selectedCount === 0;

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
                const response = await fetch(`/api/music/tracks/${trackID}/tags/${tagID}`, {
                    method,
                });

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
        await renderLibrary();
    }

    function selectVisibleTracks() {
        const visibleTrackIDs = getVisibleTrackIDs();

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

        renderLibrary();
    }

    function clearSelection() {
        selectedTrackIDs.clear();
        renderLibrary();
    }

    async function addSelectedToPlaylist() {
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
    }

    selectVisibleButton.addEventListener("click", selectVisibleTracks);

    applyBulkTagButton.addEventListener("click", () => {
        applyBulkTag("POST");
    });

    removeBulkTagButton.addEventListener("click", () => {
        applyBulkTag("DELETE");
    });

    clearSelectionButton.addEventListener("click", clearSelection);

    bulkTagSelect.addEventListener("change", updateToolbar);

    addBulkPlaylistButton.addEventListener("click", addSelectedToPlaylist);

    function playSelection() {
        const tracks = getSelectedVisibleTracks();

        if (tracks.length === 0) {
            return;
        }

        musicPlayer.playSelection(tracks);
        clearSelection();
    }

    function addSelectedToQueue() {
        const tracks = getSelectedVisibleTracks();

        if (tracks.length === 0) {
            return;
        }

        musicPlayer.addToQueue(tracks);
        clearSelection();
    }

    function playSelectedNext() {
        const tracks = getSelectedVisibleTracks();

        if (tracks.length === 0) {
            return;
        }

        musicPlayer.playNext(tracks);
        clearSelection();
    }

    playSelectionButton.addEventListener("click", playSelection);
    addToQueueButton.addEventListener("click", addSelectedToQueue);
    playNextButton.addEventListener("click", playSelectedNext);

    return {
        getSelectedTrackIDs: () => selectedTrackIDs,
        updateToolbar,
    };
}
