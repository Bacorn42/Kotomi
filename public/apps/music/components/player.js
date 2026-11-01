import { formatDuration } from "../utils/formatting.js";

export function initializeMusicPlayer({ queue }) {
    const musicPlayer = document.getElementById("musicPlayer");
    const audioPlayer = document.getElementById("audioPlayer");

    const playerArtwork = document.getElementById("playerArtwork");
    const playerArtworkPlaceholder = document.getElementById("playerArtworkPlaceholder");
    const playerTitle = document.getElementById("playerTitle");
    const playerArtist = document.getElementById("playerArtist");

    const previousTrackButton = document.getElementById("previousTrackButton");
    const playPauseButton = document.getElementById("playPauseButton");
    const nextTrackButton = document.getElementById("nextTrackButton");

    const playerSeek = document.getElementById("playerSeek");
    const playerCurrentTime = document.getElementById("playerCurrentTime");
    const playerDuration = document.getElementById("playerDuration");

    const muteButton = document.getElementById("muteButton");
    const volumeSlider = document.getElementById("volumeSlider");

    const shuffleButton = document.createElement("button");
    shuffleButton.type = "button";
    shuffleButton.className = "kotomi-button-secondary music-player-mode-button";
    shuffleButton.textContent = "🔀";
    shuffleButton.title = "Shuffle off";
    shuffleButton.setAttribute("aria-label", "Enable shuffle");
    shuffleButton.setAttribute("aria-pressed", "false");

    const repeatButton = document.createElement("button");
    repeatButton.type = "button";
    repeatButton.className = "kotomi-button-secondary music-player-mode-button";
    repeatButton.textContent = "↻";
    repeatButton.title = "Repeat off";
    repeatButton.setAttribute("aria-label", "Repeat off");
    repeatButton.setAttribute("aria-pressed", "false");

    nextTrackButton.insertAdjacentElement("afterend", shuffleButton);
    shuffleButton.insertAdjacentElement("afterend", repeatButton);

    let currentTrack = null;
    let playbackHistory = [];
    let shuffleEnabled = false;
    let repeatMode = "off";
    let repeatCycle = [];

    async function startTrack(track, { addToHistory = true } = {}) {
        if (currentTrack?.TrackID === track.TrackID) {
            if (audioPlayer.paused) {
                try {
                    await audioPlayer.play();
                } catch (error) {
                    console.error("Playback failed:", error);
                }
            }

            return;
        }

        if (addToHistory && currentTrack) {
            playbackHistory.push(currentTrack);
        }

        currentTrack = track;

        musicPlayer.classList.remove("hide");

        playerTitle.textContent = track.Title;
        playerArtist.textContent = track.Artist || "Unknown artist";

        playerArtwork.classList.add("hide");
        playerArtworkPlaceholder.classList.remove("hide");

        playerArtwork.onerror = null;

        if (track.ArtworkURL) {
            playerArtwork.src = track.ArtworkURL;
            playerArtwork.alt = `${track.Title} artwork`;
            playerArtwork.classList.remove("hide");
            playerArtworkPlaceholder.classList.add("hide");

            playerArtwork.onerror = () => {
                playerArtwork.classList.add("hide");
                playerArtworkPlaceholder.classList.remove("hide");
            };
        }

        audioPlayer.src = `/api/music/tracks/${track.TrackID}/stream`;
        audioPlayer.load();

        try {
            await audioPlayer.play();
        } catch (error) {
            console.error("Playback failed:", error);
            updatePlayerControls();
        }
    }

    async function playTrack(track) {
        queue.clear();
        repeatCycle = [track];

        if (currentTrack?.TrackID === track.TrackID) {
            if (audioPlayer.paused) {
                try {
                    await audioPlayer.play();
                } catch (error) {
                    console.error("Playback failed:", error);
                }
            } else {
                audioPlayer.pause();
            }

            return;
        }

        await startTrack(track);
    }

    async function playSelection(tracks) {
        if (tracks.length === 0) {
            return;
        }

        queue.replace(tracks.slice(1));
        repeatCycle = [tracks[0]];

        await startTrack(tracks[0]);
    }

    function addToQueue(tracks) {
        queue.append(tracks);
    }

    function playNext(tracks) {
        queue.prepend(tracks);
    }

    function updatePlayerControls() {
        const isPlaying = !audioPlayer.paused;

        playPauseButton.textContent = isPlaying ? "Ⅱ" : "▶";
        playPauseButton.setAttribute("aria-label", isPlaying ? "Pause" : "Play");
    }

    function updatePlayerProgress() {
        const duration = audioPlayer.duration || 0;
        const currentTime = audioPlayer.currentTime || 0;

        playerSeek.max = duration || 100;
        playerSeek.value = currentTime;

        playerCurrentTime.textContent = formatDuration(currentTime);
        playerDuration.textContent = formatDuration(duration);
    }

    function updateModeButtons() {
        shuffleButton.classList.toggle("active", shuffleEnabled);
        shuffleButton.title = shuffleEnabled ? "Shuffle on" : "Shuffle off";
        shuffleButton.setAttribute(
            "aria-label",
            shuffleEnabled ? "Disable shuffle" : "Enable shuffle",
        );
        shuffleButton.setAttribute("aria-pressed", String(shuffleEnabled));

        const repeatLabels = {
            off: "Repeat off",
            queue: "Repeat queue",
            track: "Repeat track",
        };

        repeatButton.textContent = repeatMode === "track" ? "↻¹" : "↻";
        repeatButton.title = repeatLabels[repeatMode];
        repeatButton.setAttribute("aria-label", repeatLabels[repeatMode]);
        repeatButton.setAttribute("aria-pressed", String(repeatMode !== "off"));
        repeatButton.classList.toggle("active", repeatMode !== "off");
    }

    async function playNextTrack() {
        let nextEntry = queue.takeNext();

        if (!nextEntry && repeatMode === "queue" && repeatCycle.length > 0) {
            queue.append(repeatCycle);
            repeatCycle = [];
            nextEntry = queue.takeNext();
        }

        if (!nextEntry) {
            audioPlayer.pause();
            return;
        }

        repeatCycle.push(nextEntry.track);
        await startTrack(nextEntry.track);
    }

    async function handleTrackEnded() {
        if (repeatMode === "track" && currentTrack) {
            audioPlayer.currentTime = 0;

            try {
                await audioPlayer.play();
            } catch (error) {
                console.error("Playback failed:", error);
            }

            return;
        }

        await playNextTrack();
    }

    async function playPreviousTrack() {
        if (!currentTrack) {
            return;
        }

        if (audioPlayer.currentTime > 3) {
            audioPlayer.currentTime = 0;
            return;
        }

        const previousTrack = playbackHistory.pop();

        if (!previousTrack) {
            audioPlayer.currentTime = 0;
            return;
        }

        queue.prepend([currentTrack]);
        await startTrack(previousTrack, { addToHistory: false });
    }

    playPauseButton.addEventListener("click", async () => {
        if (!currentTrack) {
            return;
        }

        if (audioPlayer.paused) {
            try {
                await audioPlayer.play();
            } catch (error) {
                console.error("Playback failed:", error);
            }
        } else {
            audioPlayer.pause();
        }
    });

    previousTrackButton.addEventListener("click", playPreviousTrack);
    nextTrackButton.addEventListener("click", playNextTrack);

    shuffleButton.addEventListener("click", () => {
        shuffleEnabled = !shuffleEnabled;

        if (shuffleEnabled) {
            queue.shuffle();
        }

        updateModeButtons();
    });

    repeatButton.addEventListener("click", () => {
        const modes = ["off", "queue", "track"];
        const currentIndex = modes.indexOf(repeatMode);

        repeatMode = modes[(currentIndex + 1) % modes.length];

        updateModeButtons();
    });

    audioPlayer.addEventListener("play", updatePlayerControls);
    audioPlayer.addEventListener("pause", updatePlayerControls);

    audioPlayer.addEventListener("timeupdate", updatePlayerProgress);
    audioPlayer.addEventListener("loadedmetadata", updatePlayerProgress);

    audioPlayer.addEventListener("ended", handleTrackEnded);

    playerSeek.addEventListener("input", () => {
        if (Number.isFinite(audioPlayer.duration)) {
            audioPlayer.currentTime = Number(playerSeek.value);
        }
    });

    volumeSlider.addEventListener("input", () => {
        audioPlayer.volume = Number(volumeSlider.value);
    });

    muteButton.addEventListener("click", () => {
        audioPlayer.muted = !audioPlayer.muted;
        muteButton.textContent = audioPlayer.muted ? "🔇" : "🔊";
        muteButton.setAttribute("aria-label", audioPlayer.muted ? "Unmute" : "Mute");
    });

    audioPlayer.addEventListener("volumechange", () => {
        volumeSlider.value = audioPlayer.muted ? 0 : audioPlayer.volume;

        muteButton.textContent = audioPlayer.muted || audioPlayer.volume === 0 ? "🔇" : "🔊";
    });

    updateModeButtons();

    return {
        playTrack,
        playSelection,
        addToQueue,
        playNext,
    };
}
