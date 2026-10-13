import { initializeKotomiApp, getCurrentUser } from "/js/kotomi.js";

initializeKotomiApp("image-generator");

const socket = io();

const ui = {
    button: document.getElementById("generate"),
    cancel: document.getElementById("cancel"),
    prompt: document.getElementById("prompt"),
    model: document.getElementById("modelSelect"),
    status: document.getElementById("status"),
    progress: document.getElementById("progress"),
    result: document.getElementById("result"),
    resolution: document.getElementById("resolutionSelect"),
    steps: document.getElementById("stepsInput"),
    enhancePrompt: document.getElementById("enhancePrompt"),
    promptOutput: document.getElementById("promptOutput"),
    history: document.getElementById("history"),
    historyGrid: document.getElementById("historyGrid"),

    toggleSelection: document.getElementById("toggleSelection"),
    selectionActions: document.getElementById("selectionActions"),
    selectionCount: document.getElementById("selectionCount"),
    selectAllImages: document.getElementById("selectAllImages"),
    deleteSelectedImages: document.getElementById("deleteSelectedImages"),
    cancelSelection: document.getElementById("cancelSelection"),

    modal: document.getElementById("imageModal"),
    modalImage: document.getElementById("modalImage"),
    modalPrompt: document.getElementById("modalPrompt"),
    modalDetails: document.getElementById("modalDetails"),
    closeModal: document.getElementById("closeModal"),

    downloadImage: document.getElementById("downloadImage"),
    regenerateImage: document.getElementById("regenerateImage"),
    deleteImage: document.getElementById("deleteImage"),
};

let displayedProgress = 0;
let targetProgress = 0;
let progressTimer = null;

let selectedImage = null;
let selectionMode = false;
const selectedImageIds = new Set();
let currentUser = null;

async function initialize() {
    try {
        currentUser = await getCurrentUser();
        await loadModels();

        if (!currentUser) {
            ui.status.innerText = "Please login to generate and view images.";
            ui.button.disabled = true;
            return;
        }

        await loadHistory();
        ui.history.classList.remove("hide");
    } catch (error) {
        console.error(error);
        ui.status.innerText = "Unable to initialize application.";
    }
}

socket.on("status", (message) => {
    ui.status.innerText = message;
});

socket.on("progress", (percent) => {
    targetProgress = percent;
    animateProgress();
});

socket.on("prompt", (prompt) => {
    ui.promptOutput.innerText = prompt;
});

socket.on("generation-started", () => {
    ui.cancel.classList.remove("hide");
});

ui.button.onclick = generateImage;
ui.cancel.onclick = cancelImageGeneration;

ui.enhancePrompt.addEventListener("change", () => {
    ui.model.disabled = !ui.enhancePrompt.checked;
});

ui.closeModal.onclick = hideModal;

ui.modal.onclick = (event) => {
    if (event.target === ui.modal) {
        hideModal();
    }
};

ui.downloadImage.onclick = downloadImageFile;
ui.deleteImage.onclick = deleteSelectedImage;
ui.regenerateImage.onclick = regenerateSelectedImage;

ui.toggleSelection.onclick = toggleSelectionMode;
ui.selectAllImages.onclick = selectAllImages;
ui.deleteSelectedImages.onclick = deleteSelectedImages;
ui.cancelSelection.onclick = exitSelectionMode;

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !ui.modal.classList.contains("hide")) {
        hideModal();
    }
});

ui.prompt.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.key === "Enter") {
        generateImage();
    }
});

async function generateImage() {
    if (!currentUser) {
        ui.status.innerText = "Please login before generating images.";
        return;
    }

    setGenerating(true);
    resetProgress();

    try {
        const request = buildGenerationRequest();
        const response = await fetch("/api/image/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            throw new Error("Image generation failed.");
        }

        const data = await response.json();
        if (data === null) {
            setGenerating(false);
            return;
        }
        displayImage(data.filename);

        ui.status.innerText = "Image generated";
        await loadHistory();
    } catch (error) {
        console.error(error);
        ui.status.innerText = "Generation failed.";
    } finally {
        setGenerating(false);
    }
}

function buildGenerationRequest() {
    const resolution = Number(ui.resolution.value);

    return {
        prompt: ui.prompt.value,
        model: ui.model.value,
        enhancePrompt: ui.enhancePrompt.checked,
        settings: {
            width: resolution,
            height: resolution,
            steps: Number(ui.steps.value),
        },
    };
}

function displayImage(filename) {
    ui.result.src = `/api/image/view?filename=${filename}`;
    ui.result.style.display = "block";
    ui.cancel.classList.add("hide");
}

function setGenerating(isGenerating) {
    ui.button.disabled = isGenerating;
    ui.button.innerText = isGenerating ? "Generating..." : "✨ Generate Image";
}

async function loadModels() {
    ui.button.disabled = true;

    try {
        const response = await fetch("/api/ai/models");
        if (!response.ok) {
            throw new Error("Unable to retrieve models.");
        }

        const models = await response.json();
        populateModelList(models);
    } finally {
        ui.button.disabled = false;
    }
}

async function loadHistory() {
    ui.historyGrid.innerHTML = "Loading...";

    const response = await fetch("/api/image/history");

    if (!response.ok) {
        throw new Error("Unable to load history.");
    }

    const images = await response.json();

    renderHistory(images);
}

function renderHistory(images) {
    ui.historyGrid.innerHTML = "";

    const availableIds = new Set(images.map((image) => String(image.ImageID)));

    for (const id of selectedImageIds) {
        if (!availableIds.has(id)) {
            selectedImageIds.delete(id);
        }
    }

    for (const image of images) {
        const imageId = String(image.ImageID);
        const card = document.createElement("div");

        card.className = "history-card";
        card.dataset.imageId = imageId;

        if (selectionMode) {
            card.classList.add("selection-mode");
        }

        card.innerHTML = `
            <input
                type="checkbox"
                class="history-select-checkbox ${selectionMode ? "" : "hide"}"
                aria-label="Select image"
                ${selectedImageIds.has(imageId) ? "checked" : ""}
            >

            <img
                src="/api/image/view?filename=${encodeURIComponent(image.Filename)}"
                alt="Generated image"
            >

            <div class="history-card-content">
                <p class="history-prompt">${escapeHtml(image.Prompt || "")}</p>

                <small>
                    ${image.Width}×${image.Height}
                    ·
                    ${image.Steps} steps
                </small>
            </div>
        `;

        card.onclick = () => {
            if (selectionMode) {
                toggleImageSelection(imageId);
            } else {
                showImageDetails(image.ImageID);
            }
        };

        const checkbox = card.querySelector(".history-select-checkbox");

        checkbox.onclick = (event) => {
            event.stopPropagation();
        };

        checkbox.onchange = () => {
            setImageSelected(imageId, checkbox.checked);
        };

        ui.historyGrid.appendChild(card);
    }

    updateSelectionUI();
}

function toggleSelectionMode() {
    selectionMode = !selectionMode;

    if (!selectionMode) {
        selectedImageIds.clear();
    }

    ui.toggleSelection.classList.toggle("hide", selectionMode);

    renderHistoryFromDOM();
}

function renderHistoryFromDOM() {
    // Rebuild the current card selection controls without re-fetching history.
    const cards = ui.historyGrid.querySelectorAll(".history-card");

    for (const card of cards) {
        const checkbox = card.querySelector(".history-select-checkbox");

        card.classList.toggle("selection-mode", selectionMode);
        card.classList.toggle("selected", selectedImageIds.has(card.dataset.imageId));

        checkbox.classList.toggle("hide", !selectionMode);
        checkbox.checked = selectedImageIds.has(card.dataset.imageId);
    }

    updateSelectionUI();
}

function toggleImageSelection(imageId) {
    setImageSelected(imageId, !selectedImageIds.has(imageId));
}

function setImageSelected(imageId, isSelected) {
    if (isSelected) {
        selectedImageIds.add(imageId);
    } else {
        selectedImageIds.delete(imageId);
    }

    renderHistoryFromDOM();
}

function selectAllImages() {
    const cards = ui.historyGrid.querySelectorAll(".history-card");

    for (const card of cards) {
        selectedImageIds.add(card.dataset.imageId);
    }

    renderHistoryFromDOM();
}

function exitSelectionMode() {
    selectionMode = false;
    selectedImageIds.clear();

    ui.toggleSelection.classList.remove("hide");

    renderHistoryFromDOM();
}

function updateSelectionUI() {
    ui.selectionActions.classList.toggle("hide", !selectionMode);

    ui.selectionCount.innerHTML = `
        <span class="selection-indicator"></span>
        <span>${selectedImageIds.size} selected</span>
    `;

    ui.deleteSelectedImages.disabled = selectedImageIds.size === 0;

    const cards = ui.historyGrid.querySelectorAll(".history-card");

    for (const card of cards) {
        card.classList.toggle("selected", selectedImageIds.has(card.dataset.imageId));
    }
}

async function showImageDetails(id) {
    const response = await fetch(`/api/image/${id}`);

    if (!response.ok) {
        console.error("Unable to load image details.");
        return;
    }

    const image = await response.json();
    selectedImage = image;

    ui.modalImage.src = `/api/image/view?filename=${image.Filename}`;
    ui.modalPrompt.innerText = image.Prompt;
    ui.modalDetails.innerHTML = `
        <p>
            <strong>Resolution:</strong>
            ${image.Width} × ${image.Height}
        </p>

        <p>
            <strong>Steps:</strong>
            ${image.Steps}
        </p>

        <p>
            <strong>Seed:</strong>
            ${image.Seed}
        </p>

        <p>
            <strong>Model:</strong>
            ${image.Model}
        </p>

        <p>
            <strong>Created:</strong>
            ${new Date(image.CreatedDate).toLocaleString()}
        </p>

        <p>
            <strong>Enhanced Prompt:</strong><br>
            ${image.EnhancedPrompt}
        </p>
    `;

    ui.modal.classList.remove("hide");
}

function populateModelList(models) {
    ui.model.innerHTML = "";

    for (const model of models) {
        const option = document.createElement("option");
        option.value = model.name;
        option.textContent = model.name;
        ui.model.appendChild(option);
    }
}

async function cancelImageGeneration() {
    await fetch(`/api/image/cancel`, {
        method: "POST",
    });
    ui.status.innerHTML = "Generation cancelled";
    resetProgress();
    ui.cancel.classList.add("hide");
    setGenerating(false);
}

function animateProgress() {
    if (progressTimer) {
        return;
    }

    progressTimer = setInterval(() => {
        if (displayedProgress >= targetProgress) {
            clearInterval(progressTimer);
            progressTimer = null;
            return;
        }

        displayedProgress += 1;

        ui.progress.value = displayedProgress;
        ui.status.innerText = `Generating image: ${displayedProgress}%`;
    }, 60);
}

function downloadImageFile() {
    if (!selectedImage) {
        return;
    }

    const filename = selectedImage.Filename;
    const date = new Date(selectedImage.CreatedDate).toISOString().split("T")[0];

    const link = document.createElement("a");
    link.href = `/api/image/view?filename=${filename}`;
    link.download = `kotomi-image-${selectedImage.ImageID}-${date}.png`;

    link.click();
    ui.status.innerText = "Image downloaded";
}

async function deleteSelectedImage() {
    if (!selectedImage) {
        return;
    }

    const confirmed = confirm("Are you sure you want to delete this image?");

    if (!confirmed) {
        return;
    }

    const response = await fetch(`/api/image/${selectedImage.ImageID}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        console.error("Unable to delete image.");
        return;
    }

    await loadHistory();
    hideModal();
    selectedImage = null;
    ui.status.innerText = "Image deleted";
}

async function deleteSelectedImages() {
    if (selectedImageIds.size === 0) {
        return;
    }

    const count = selectedImageIds.size;
    const confirmed = confirm(
        `Are you sure you want to delete ${count} selected image${count === 1 ? "" : "s"}? This cannot be undone.`,
    );

    if (!confirmed) {
        return;
    }

    ui.deleteSelectedImages.disabled = true;
    ui.status.innerText = `Deleting ${count} images...`;

    try {
        const response = await fetch("/api/image/bulk-delete", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                imageIds: [...selectedImageIds],
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Unable to delete images.");
        }

        const deletedCount = result.deleted.length;
        const failedCount = result.failed.length;

        selectedImageIds.clear();

        await loadHistory();

        if (failedCount === 0) {
            exitSelectionMode();
            ui.status.innerText = `Successfully deleted ${deletedCount} image${deletedCount === 1 ? "" : "s"}.`;
        } else {
            ui.status.innerText = `Deleted ${deletedCount} image${deletedCount === 1 ? "" : "s"}; ${failedCount} failed. Check the console for details.`;

            console.error("Bulk deletion failures:", result.failed);
        }
    } catch (error) {
        console.error(error);
        ui.status.innerText = error.message || "Bulk deletion failed.";
    } finally {
        ui.deleteSelectedImages.disabled = selectedImageIds.size === 0;
    }
}

async function regenerateSelectedImage() {
    if (!selectedImage) {
        return;
    }

    hideModal();

    ui.prompt.value = selectedImage.Prompt;
    ui.model.value = selectedImage.Model;
    ui.resolution.value = selectedImage.Width;
    ui.steps.value = selectedImage.Steps;

    await generateImage();
}

function resetProgress() {
    if (progressTimer) {
        clearInterval(progressTimer);
        progressTimer = null;
    }

    displayedProgress = 0;
    targetProgress = 0;
    ui.progress.value = 0;
}

function hideModal() {
    ui.modal.classList.add("hide");
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

initialize();
