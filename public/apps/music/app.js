import { initializeKotomiApp } from "/js/kotomi.js";
import { initializeMusicPlayer } from "./components/player.js";
import { initializeTags } from "./components/tags.js";
import { initializePlaylists } from "./components/playlists.js";
import { initializeTrackList } from "./components/track-list.js";
import { initializeUpload } from "./components/upload.js";
import { initializeLibrary } from "./components/library.js";
import { initializeBulkActions } from "./components/bulk-actions.js";
import { initializeQueue } from "./components/queue.js";
import { initializeQueuePanel } from "./components/queue-panel.js";
import { initializePlaybackHistory } from "./components/history.js";
import { initializeHistoryPanel } from "./components/history-panel.js";

initializeKotomiApp("music");

const musicQueue = initializeQueue();
const playbackHistory = initializePlaybackHistory();

const musicPlayer = initializeMusicPlayer({
    queue: musicQueue,
    history: playbackHistory,
});

initializeQueuePanel({
    queue: musicQueue,
});

initializeHistoryPanel({
    history: playbackHistory,
    musicPlayer,
});

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
    musicPlayer,
    getVisibleTrackIDs: () => library.getVisibleTrackIDs(),
    getTracks: () => library.getTracks(),
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
