export function initializeTags({ onTracksChanged, onBulkOptionsChanged }) {
    const tagForm = document.getElementById("tagForm");
    const tagNameInput = document.getElementById("tagNameInput");
    const tagStatus = document.getElementById("tagStatus");
    const tagList = document.getElementById("tagList");
    const bulkTagSelect = document.getElementById("bulkTagSelect");

    let tags = [];
    let selectedTagID = null;

    function showStatus(message) {
        tagStatus.textContent = message;
        tagStatus.classList.remove("hide");
    }

    function renderBulkOptions() {
        bulkTagSelect.replaceChildren();

        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.textContent = "Choose a tag...";

        bulkTagSelect.appendChild(placeholder);

        for (const tag of tags) {
            const option = document.createElement("option");
            option.value = tag.TagID;
            option.textContent = tag.Name;
            bulkTagSelect.appendChild(option);
        }

        onBulkOptionsChanged();
    }

    function renderTags() {
        tagList.replaceChildren();

        const allButton = document.createElement("button");
        allButton.type = "button";
        allButton.className = "music-tag-item";
        allButton.textContent = "All tracks";

        if (selectedTagID === null) {
            allButton.classList.add("active");
        }

        allButton.addEventListener("click", () => {
            selectedTagID = null;
            renderTags();
            onTracksChanged();
        });

        tagList.appendChild(allButton);

        for (const tag of tags) {
            const item = document.createElement("div");
            item.className = "music-tag-item";

            if (selectedTagID === tag.TagID) {
                item.classList.add("active");
            }

            const filterButton = document.createElement("button");
            filterButton.type = "button";
            filterButton.className = "music-tag-filter";
            filterButton.textContent = tag.Name;

            filterButton.addEventListener("click", () => {
                selectedTagID = selectedTagID === tag.TagID ? null : tag.TagID;

                renderTags();
                onTracksChanged();
            });

            const count = document.createElement("span");
            count.className = "music-tag-count";
            count.textContent = tag.TrackCount;

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "music-tag-delete";
            deleteButton.textContent = "×";
            deleteButton.title = `Delete ${tag.Name}`;

            deleteButton.addEventListener("click", async () => {
                if (!confirm(`Delete the tag "${tag.Name}"?`)) {
                    return;
                }

                try {
                    const response = await fetch(`/api/music/tags/${tag.TagID}`, {
                        method: "DELETE",
                    });

                    if (!response.ok) {
                        throw new Error("Failed to delete tag.");
                    }

                    if (selectedTagID === tag.TagID) {
                        selectedTagID = null;
                    }

                    await loadTags();
                    onTracksChanged();
                } catch (error) {
                    showStatus(error.message);
                }
            });

            item.append(filterButton, count, deleteButton);
            tagList.appendChild(item);
        }

        renderBulkOptions();
    }

    async function loadTags() {
        try {
            const response = await fetch("/api/music/tags");

            if (!response.ok) {
                throw new Error("Failed to load tags.");
            }

            const data = await response.json();
            tags = data.tags;

            renderTags();
        } catch (error) {
            showStatus(error.message);
        }
    }

    function createTrackTagEditor(track) {
        const editor = document.createElement("div");
        editor.className = "music-track-tags-editor";

        const heading = document.createElement("h3");
        heading.textContent = "Track tags";

        editor.appendChild(heading);

        if (tags.length === 0) {
            const empty = document.createElement("p");
            empty.textContent = "Create a tag in the sidebar first.";
            editor.appendChild(empty);
            return editor;
        }

        for (const tag of tags) {
            const label = document.createElement("label");
            label.className = "music-track-tag-option";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = track.Tags.some((assignedTag) => assignedTag.TagID === tag.TagID);

            const name = document.createElement("span");
            name.textContent = tag.Name;

            checkbox.addEventListener("change", async () => {
                checkbox.disabled = true;

                const method = checkbox.checked ? "POST" : "DELETE";

                try {
                    const response = await fetch(
                        `/api/music/tracks/${track.TrackID}/tags/${tag.TagID}`,
                        { method },
                    );

                    const result = await response.json();

                    if (!response.ok) {
                        throw new Error(result.message || "Failed to update tag.");
                    }

                    if (checkbox.checked) {
                        track.Tags.push({
                            TagID: tag.TagID,
                            Name: tag.Name,
                        });
                    } else {
                        track.Tags = track.Tags.filter(
                            (assignedTag) => assignedTag.TagID !== tag.TagID,
                        );
                    }

                    await loadTags();
                    onTracksChanged();
                } catch (error) {
                    checkbox.checked = !checkbox.checked;
                    showStatus(error.message);
                    checkbox.disabled = false;
                }
            });

            label.append(checkbox, name);
            editor.appendChild(label);
        }

        return editor;
    }

    tagForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const name = tagNameInput.value.trim();

        if (!name) {
            return;
        }

        try {
            const response = await fetch("/api/music/tags", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ Name: name }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to create tag.");
            }

            tagNameInput.value = "";
            tagStatus.classList.add("hide");

            await loadTags();
        } catch (error) {
            showStatus(error.message);
        }
    });

    function clearStatus() {
        tagStatus.classList.add("hide");
    }

    return {
        loadTags,
        getTags: () => tags,
        getSelectedTagID: () => selectedTagID,
        createTrackTagEditor,
        showStatus,
        clearStatus,
    };
}
