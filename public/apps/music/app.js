import { initializeKotomiApp } from "/js/kotomi.js";
import { initializeMusicPlayer } from "./components/player.js";
import { initializeTags } from "./components/tags.js";
import { initializePlaylists } from "./components/playlists.js";
import { initializeTrackList } from "./components/track-list.js";
import { initializeUpload } from "./components/upload.js";
import { initializeLibrary } from "./components/library.js";
import { initializeBulkActions } from "./components/bulk-actions.js";

initializeKotomiApp("music");

const musicPlayer = initializeMusicPlayer();

let library;
let bulkActions;

const tags = initializeTags({
    onTracksChanged: () => library.render(),
    onBulkOptionsChanged: () => bulkActions.updateToolbar(),
});

const playlists = initializePlaylists({
    onTracksChanged: () => library.render(),
});

bulkActions = initializeBulkActions({
    tags,
    playlists,
    getVisibleTrackIDs: () => library.getVisibleTrackIDs(),
    renderLibrary: () => library.render(),
});

const trackList = initializeTrackList({
    tags,
    playlists,
    musicPlayer,
    onTracksChanged: () => library.loadTracks(),
    onSelectionChanged: bulkActions.updateToolbar,
});

library = initializeLibrary({
    tags,
    playlists,
    trackList,
    getSelectedTrackIDs: bulkActions.getSelectedTrackIDs,
    onVisibleTracksChanged: bulkActions.updateToolbar,
});

initializeUpload({
    onUploadComplete: () => library.loadTracks(),
});

playlists.loadPlaylists();
tags.loadTags();
library.loadTracks();
