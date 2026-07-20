const socket = io();

const ui = {
    button: document.getElementById("generate"),
    prompt: document.getElementById("prompt"),
    model: document.getElementById("modelSelect"),
    generateButton: document.getElementById("generateButton"),
    status: document.getElementById("status"),
    progress: document.getElementById("progress"),
    resolution: document.getElementById("resolutionSelect"),
    steps: document.getElementById("stepsInput"),
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

ui.button.onclick = async () => {
    ui.button.disabled = true;
    ui.button.innerText = "Generating...";

    socket.emit("status", "Starting generation...");

    const prompt = ui.prompt.value;
    const model = ui.model.value;
    const resolution = Number(ui.resolution.value);
    const settings = {
        width: resolution,
        height: resolution,
        steps: Number(ui.steps.value),
    };

    status.innerText = "Generating...";

    const response = await fetch("/api/image/generate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            prompt,
            model,
            settings,
        }),
    });

    const data = await response.json();
    console.log(data);

    const img = document.getElementById("result");
    img.src = `/api/image/view?filename=${data.filename}`;
    img.style.display = "block";

    ui.status.innerText = "Image generated";

    ui.button.disabled = false;
    ui.button.innerText = "✨ Generate Image";
};

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
