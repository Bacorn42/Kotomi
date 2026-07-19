const button = document.getElementById("generate");

button.onclick = async () => {
    const prompt = document.getElementById("prompt").value;
    const status = document.getElementById("status");

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

    status.innerText = "Prompt received: " + data.enhanced;
};
