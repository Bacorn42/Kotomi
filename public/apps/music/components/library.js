export function initializeLibrary({
    tags,
    playlists,
    trackList,
    getSelectedTrackIDs,
    onVisibleTracksChanged,
}) {
    const libraryEmpty = document.getElementById("libraryEmpty");
    const searchInput = document.getElementById("searchInput");
    const sortSelect = document.getElementById("sortSelect");
    const sortDirectionButton = document.getElementById("sortDirectionButton");
    const libraryHeading = document.getElementById("libraryHeading");

    let tracks = [];
    let visibleTrackIDs = [];
    let sortDescending = true;

    function render() {
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

        const searchTerms = searchInput.value.trim().toLowerCase().split(/\s+/).filter(Boolean);

        const sortBy = sortSelect.value;
        const selectedTagID = tags.getSelectedTagID();

        const filteredTracks = sourceTracks.filter((track) => {
            const searchableText = [
                track.Title,
                track.Artist,
                track.Album,
                ...track.Tags.map((tag) => tag.Name),
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            const matchesSearch = searchTerms.every((term) => searchableText.includes(term));

            const matchesTag =
                selectedTagID === null || track.Tags.some((tag) => tag.TagID === selectedTagID);

            return matchesSearch && matchesTag;
        });

        filteredTracks.sort((a, b) => {
            let comparison = 0;

            if (sortBy === "added") {
                comparison = new Date(a.AddedDate) - new Date(b.AddedDate);
            } else {
                const field =
                    sortBy === "title" ? "Title" : sortBy === "artist" ? "Artist" : "Album";

                const valueA = (a[field] || "").toLowerCase();
                const valueB = (b[field] || "").toLowerCase();

                comparison = valueA.localeCompare(valueB);
            }

            return sortDescending ? -comparison : comparison;
        });

        visibleTrackIDs = filteredTracks.map((track) => track.TrackID);

        onVisibleTracksChanged();

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
                emptyMessage = "No tracks match your current filters.";
            }
        }

        trackList.render(filteredTracks, getSelectedTrackIDs(), emptyMessage);
    }

    async function loadTracks() {
        try {
            const response = await fetch("/api/music/tracks");

            if (!response.ok) {
                throw new Error("Failed to load music library.");
            }

            const data = await response.json();

            tracks = data.tracks;
            render();
        } catch (error) {
            console.error(error);
        }
    }

    searchInput.addEventListener("input", render);

    sortSelect.addEventListener("change", render);

    sortDirectionButton.addEventListener("click", () => {
        sortDescending = !sortDescending;
        sortDirectionButton.textContent = sortDescending ? "↓" : "↑";

        render();
    });

    return {
        render,
        loadTracks,
        getTracks: () => tracks,
        getVisibleTrackIDs: () => visibleTrackIDs,
    };
}
