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

    let currentTrack = null;
    let playbackHistory = [];

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

    async function playNextTrack() {
        const nextEntry = queue.takeNext();

        if (!nextEntry) {
            audioPlayer.pause();
            return;
        }

        await startTrack(nextEntry.track);
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

    audioPlayer.addEventListener("play", updatePlayerControls);
    audioPlayer.addEventListener("pause", updatePlayerControls);

    audioPlayer.addEventListener("timeupdate", updatePlayerProgress);
    audioPlayer.addEventListener("loadedmetadata", updatePlayerProgress);

    audioPlayer.addEventListener("ended", playNextTrack);

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

    return {
        playTrack,
        playSelection,
        addToQueue,
        playNext,
    };
}
