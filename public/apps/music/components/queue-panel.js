export function initializeQueuePanel({ queue }) {
    const musicPlayer = document.getElementById("musicPlayer");
    const nextTrackButton = document.getElementById("nextTrackButton");

    const toggleButton = document.createElement("button");
    toggleButton.type = "button";
    toggleButton.className = "music-queue-toggle";
    toggleButton.textContent = "Queue (0)";
    toggleButton.setAttribute("aria-label", "Open queue");
    toggleButton.setAttribute("aria-expanded", "false");

    nextTrackButton.insertAdjacentElement("afterend", toggleButton);

    const panel = document.createElement("section");
    panel.className = "music-queue-panel hide";
    panel.setAttribute("aria-label", "Playback queue");

    panel.innerHTML = `
        <div class="music-queue-header">
            <div>
                <h2>Up Next</h2>
                <span class="music-queue-count">0 tracks</span>
            </div>

            <div class="music-queue-header-actions">
                <button type="button" class="music-queue-clear" disabled>
                    Clear
                </button>
                <button type="button" class="music-queue-close" aria-label="Close queue">
                    ×
                </button>
            </div>
        </div>

        <div class="music-queue-list"></div>
    `;

    musicPlayer.appendChild(panel);

    const countElement = panel.querySelector(".music-queue-count");
    const clearButton = panel.querySelector(".music-queue-clear");
    const closeButton = panel.querySelector(".music-queue-close");
    const listElement = panel.querySelector(".music-queue-list");

    function setOpen(isOpen) {
        panel.classList.toggle("hide", !isOpen);
        toggleButton.setAttribute("aria-expanded", String(isOpen));
        toggleButton.setAttribute("aria-label", isOpen ? "Close queue" : "Open queue");
    }

    function createQueueEntry(entry, index, total) {
        const row = document.createElement("div");
        row.className = "music-queue-entry";

        const details = document.createElement("div");
        details.className = "music-queue-entry-details";

        const title = document.createElement("div");
        title.className = "music-queue-entry-title";
        title.textContent = entry.track.Title;

        const artist = document.createElement("div");
        artist.className = "music-queue-entry-artist";
        artist.textContent = entry.track.Artist || "Unknown artist";

        details.append(title, artist);

        const actions = document.createElement("div");
        actions.className = "music-queue-entry-actions";

        const moveUpButton = document.createElement("button");
        moveUpButton.type = "button";
        moveUpButton.textContent = "↑";
        moveUpButton.setAttribute("aria-label", `Move ${entry.track.Title} up`);
        moveUpButton.disabled = index === 0;
        moveUpButton.addEventListener("click", () => {
            queue.move(entry.id, index - 1);
        });

        const moveDownButton = document.createElement("button");
        moveDownButton.type = "button";
        moveDownButton.textContent = "↓";
        moveDownButton.setAttribute("aria-label", `Move ${entry.track.Title} down`);
        moveDownButton.disabled = index === total - 1;
        moveDownButton.addEventListener("click", () => {
            queue.move(entry.id, index + 1);
        });

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.textContent = "×";
        removeButton.setAttribute("aria-label", `Remove ${entry.track.Title}`);
        removeButton.addEventListener("click", () => {
            queue.remove(entry.id);
        });

        actions.append(moveUpButton, moveDownButton, removeButton);
        row.append(details, actions);

        return row;
    }

    function render(entries) {
        const count = entries.length;

        countElement.textContent = `${count} ${count === 1 ? "track" : "tracks"}`;
        toggleButton.textContent = `Queue (${count})`;
        clearButton.disabled = count === 0;

        listElement.replaceChildren();

        if (count === 0) {
            const emptyMessage = document.createElement("div");
            emptyMessage.className = "music-queue-empty";
            emptyMessage.textContent = "Your queue is empty.";

            listElement.appendChild(emptyMessage);
            return;
        }

        entries.forEach((entry, index) => {
            listElement.appendChild(createQueueEntry(entry, index, count));
        });
    }

    toggleButton.addEventListener("click", () => {
        const isOpening = panel.classList.contains("hide");

        if (isOpening) {
            document.dispatchEvent(new CustomEvent("music-panel-open", { detail: "queue" }));
        }

        setOpen(isOpening);
    });

    closeButton.addEventListener("click", () => {
        setOpen(false);
    });

    clearButton.addEventListener("click", () => {
        queue.clear();
    });

    document.addEventListener("music-panel-open", (event) => {
        if (event.detail !== "queue") {
            setOpen(false);
        }
    });

    queue.subscribe(render);
}
