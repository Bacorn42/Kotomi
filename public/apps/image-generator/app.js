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
    history: document.getElementById("historyGrid"),
};

let displayedProgress = 0;
let targetProgress = 0;
let progressTimer = null;

async function initialize() {
    await loadModels();
    await loadHistory();
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
    const response = await fetch("/api/ai/models");
    if (!response.ok) {
        throw new Error("Unable to retrieve models.");
    }

    const models = await response.json();
    populateModelList(models);
}

async function loadHistory() {
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

function resetProgress() {
    displayedProgress = 0;
    targetProgress = 0;
    progressTimer = null;
    ui.progress.value = 0;
}

initialize();
