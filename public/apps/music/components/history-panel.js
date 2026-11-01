export function initializeHistoryPanel({ history, musicPlayer }) {
    const musicPlayerElement = document.getElementById("musicPlayer");
    const queueToggle = document.querySelector(".music-queue-toggle");

    const toggleButton = document.createElement("button");
    toggleButton.type = "button";
    toggleButton.className = "music-queue-toggle music-history-toggle";
    toggleButton.textContent = "History";
    toggleButton.setAttribute("aria-label", "Open listening history");
    toggleButton.setAttribute("aria-expanded", "false");

    queueToggle.insertAdjacentElement("afterend", toggleButton);

    const panel = document.createElement("section");
    panel.className = "music-queue-panel music-history-panel hide";
    panel.setAttribute("aria-label", "Listening history");

    panel.innerHTML = `
        <div class="music-queue-header">
            <div>
                <h2>Recently Played</h2>
                <span class="music-queue-count">0 tracks</span>
            </div>

            <div class="music-queue-header-actions">
                <button type="button" class="music-history-clear" disabled>
                    Clear
                </button>
                <button type="button" class="music-history-close" aria-label="Close history">
                    ×
                </button>
            </div>
        </div>

        <div class="music-queue-list"></div>
    `;

    musicPlayerElement.appendChild(panel);

    const countElement = panel.querySelector(".music-queue-count");
    const clearButton = panel.querySelector(".music-history-clear");
    const closeButton = panel.querySelector(".music-history-close");
    const listElement = panel.querySelector(".music-queue-list");

    const timeFormatter = new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit",
        month: "short",
        day: "numeric",
    });

    function setOpen(isOpen) {
        panel.classList.toggle("hide", !isOpen);
        toggleButton.setAttribute("aria-expanded", String(isOpen));
        toggleButton.setAttribute(
            "aria-label",
            isOpen ? "Close listening history" : "Open listening history",
        );
    }

    function createHistoryEntry(entry) {
        const row = document.createElement("div");
        row.className = "music-queue-entry music-history-entry";

        const details = document.createElement("div");
        details.className = "music-queue-entry-details";

        const title = document.createElement("div");
        title.className = "music-queue-entry-title";
        title.textContent = entry.track.Title;

        const artist = document.createElement("div");
        artist.className = "music-queue-entry-artist";
        artist.textContent = entry.track.Artist || "Unknown artist";

        const playedAt = document.createElement("div");
        playedAt.className = "music-history-time";
        playedAt.textContent = timeFormatter.format(entry.playedAt);

        details.append(title, artist, playedAt);

        const playButton = document.createElement("button");
        playButton.type = "button";
        playButton.textContent = "▶";
        playButton.setAttribute("aria-label", `Play ${entry.track.Title}`);

        playButton.addEventListener("click", () => {
            musicPlayer.playTrack(entry.track);
            setOpen(false);
        });

        row.append(details, playButton);

        return row;
    }

    function render(entries) {
        countElement.textContent = `${entries.length} ${entries.length === 1 ? "track" : "tracks"}`;

        clearButton.disabled = entries.length === 0;
        listElement.replaceChildren();

        if (entries.length === 0) {
            const emptyMessage = document.createElement("div");
            emptyMessage.className = "music-queue-empty";
            emptyMessage.textContent = "Nothing played yet.";

            listElement.appendChild(emptyMessage);
            return;
        }

        entries.forEach((entry) => {
            listElement.appendChild(createHistoryEntry(entry));
        });
    }

    toggleButton.addEventListener("click", () => {
        const isOpening = panel.classList.contains("hide");

        if (isOpening) {
            document.dispatchEvent(new CustomEvent("music-panel-open", { detail: "history" }));
        }

        setOpen(isOpening);
    });

    closeButton.addEventListener("click", () => {
        setOpen(false);
    });

    clearButton.addEventListener("click", () => {
        history.clear();
    });

    document.addEventListener("music-panel-open", (event) => {
        if (event.detail !== "history") {
            setOpen(false);
        }
    });

    history.subscribe(render);
}
