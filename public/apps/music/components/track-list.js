import { formatDuration } from "../utils/formatting.js";

export function initializeTrackList({
    tags,
    playlists,
    musicPlayer,
    onTracksChanged,
    onSelectionChanged,
}) {
    const trackList = document.getElementById("trackList");

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
                TrackNumber: formData.get("TrackNumber")
                    ? Number(formData.get("TrackNumber"))
                    : null,
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

                await onTracksChanged();
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

    function createTrackRow(track, filteredTracks, selectedTrackIDs) {
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

            onSelectionChanged();
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

        if (playlists.getSelectedPlaylistID() !== null) {
            playlistButton = document.createElement("button");
            playlistButton.type = "button";
            playlistButton.className = "kotomi-button-secondary music-track-edit";
            playlistButton.textContent = "Remove";

            playlistButton.addEventListener("click", async () => {
                try {
                    await playlists.removeTrackFromPlaylist(
                        playlists.getSelectedPlaylistID(),
                        track.TrackID,
                    );
                    await playlists.refreshPlaylistData();
                } catch (error) {
                    playlists.showStatus(error.message);
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

                if (playlists.getPlaylists().length === 0) {
                    const empty = document.createElement("span");
                    empty.textContent = "Create a playlist first.";
                    menu.appendChild(empty);
                }

                for (const playlist of playlists.getPlaylists()) {
                    const option = document.createElement("button");
                    option.type = "button";
                    option.className = "kotomi-button-secondary";
                    option.textContent = playlist.Name;

                    option.addEventListener("click", async () => {
                        try {
                            const added = await playlists.addTrackToPlaylist(
                                playlist.PlaylistID,
                                track.TrackID,
                            );

                            if (added) {
                                await playlists.refreshPlaylistData();
                            } else {
                                menu.remove();
                            }
                        } catch (error) {
                            playlists.showStatus(error.message);
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

        return row;
    }

    function render(filteredTracks, selectedTrackIDs, emptyMessage = null) {
        trackList.replaceChildren();

        if (emptyMessage) {
            const empty = document.createElement("div");
            empty.className = "music-search-empty";
            empty.textContent = emptyMessage;
            trackList.appendChild(empty);
        }

        for (const track of filteredTracks) {
            trackList.appendChild(createTrackRow(track, filteredTracks, selectedTrackIDs));
        }
    }

    return { render };
}
