const axios = require("axios");
const fs = require("fs");
const path = require("path");

async function queueWorkflow(prompt) {
    const workflowPath = path.join(
        __dirname,
        "../../modules/image-generation/img_gen_z-image_turbo.json",
    );
    const workflow = JSON.parse(fs.readFileSync(workflowPath, "utf8"));

    workflow["2"].inputs.text = prompt;

    console.log("Sending workflow to ComfyUI...");

    const response = await axios.post("http://127.0.0.1:8188/prompt", {
        prompt: workflow,
    });

    console.log("ComfyUI prompt ID:", response.data.prompt_id);

    return response.data.prompt_id;
}

module.exports = {
    queueWorkflow,
};
