const button = document.getElementById("generate");

button.onclick = async () => {
    const prompt = document.getElementById("prompt").value;
    const status = document.getElementById("status");

    status.innerText = "Generating...";

    /*
       This will eventually call:
       POST /api/image/generate
       with the prompt.
    */

    console.log(prompt);
};
