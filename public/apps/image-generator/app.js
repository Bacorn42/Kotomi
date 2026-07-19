const socket = io();

const status = document.getElementById("status");
const progress = document.getElementById("progress");

socket.on("status", (message) => {
    status.innerText = message;
});

socket.on("progress", (percent) => {
    status.innerText = `Generating image: ${percent}%`;
    progress.value = percent;
});

const button = document.getElementById("generate");

button.onclick = async () => {
    socket.emit("status", "Starting generation...");

    const prompt = document.getElementById("prompt").value;

    status.innerText = "Generating...";

    const response = await fetch("/api/image/generate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            prompt: prompt,
        }),
    });

    const data = await response.json();
    console.log(data);

    const img = document.getElementById("result");
    img.src = `/api/image/view?filename=${data.filename}`;
    img.style.display = "block";

    status.innerText = "Image generated";
};
