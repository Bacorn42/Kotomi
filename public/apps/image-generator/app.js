const socket = io();

renderAppHeader({
    title: "✨ Image Generator",
    description: "Generate images with local AI models",
});

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
    history: document.getElementById("historyGrid"),

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

async function initialize() {
    try {
        await loadModels();
        await loadHistory();
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
    ui.history.innerHTML = "Loading...";

    const response = await fetch("/api/image/history");

    if (!response.ok) {
        throw new Error("Unable to load history.");
    }

    const images = await response.json();

    renderHistory(images);
}

function renderHistory(images) {
    ui.history.innerHTML = "";

    for (const image of images) {
        const card = document.createElement("div");

        card.className = "history-card";
        card.onclick = () => showImageDetails(image.ImageID);

        card.innerHTML = `
            <img src="/api/image/view?filename=${image.Filename}">

            <div class="history-card-content">
                <p>${image.Prompt}</p>

                <small>
                    ${image.Width}×${image.Height}
                    ·
                    ${image.Steps} steps
                </small>
            </div>
        `;

        ui.history.appendChild(card);
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

initialize();
