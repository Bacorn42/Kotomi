const socket = io();

const ui = {
    button: document.getElementById("generate"),
    prompt: document.getElementById("prompt"),
    model: document.getElementById("modelSelect"),
    status: document.getElementById("status"),
    progress: document.getElementById("progress"),
    result: document.getElementById("result"),
    resolution: document.getElementById("resolutionSelect"),
    steps: document.getElementById("stepsInput"),
    enhancePrompt: document.getElementById("enhancePrompt"),
    promptOutput: document.getElementById("promptOutput"),
};

async function initialize() {
    await loadModels();
}

socket.on("status", (message) => {
    ui.status.innerText = message;
});

socket.on("progress", (percent) => {
    ui.status.innerText = `Generating image: ${percent}%`;
    ui.progress.value = percent;
});

socket.on("prompt", (prompt) => {
    ui.promptOutput.innerText = prompt;
});

ui.button.onclick = generateImage;

ui.enhancePrompt.addEventListener("change", () => {
    ui.model.disabled = !ui.enhancePrompt.checked;
});

async function generateImage() {
    setGenerating(true);

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

function populateModelList(models) {
    ui.model.innerHTML = "";

    for (const model of models) {
        const option = document.createElement("option");
        option.value = model.name;
        option.textContent = model.name;
        ui.model.appendChild(option);
    }
}

initialize();
