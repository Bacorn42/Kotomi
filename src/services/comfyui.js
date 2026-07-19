const axios = require("axios");
const fs = require("fs");
const path = require("path");

const COMFY_URL = "http://127.0.0.1:8188";

function loadWorkflow() {
    const workflowPath = path.join(
        __dirname,
        "../../modules/image-generation/img_gen_z-image_turbo.json",
    );

    return JSON.parse(fs.readFileSync(workflowPath, "utf8"));
}

async function queueWorkflow(prompt) {
    const workflow = loadWorkflow();

    workflow["2"].inputs.text = prompt;

    const response = await axios.post(`${COMFY_URL}/prompt`, {
        prompt: workflow,
    });

    return response.data.prompt_id;
}

async function waitForCompletion(promptID) {
    console.log("Waiting for ComfyUI...");

    while (true) {
        const response = await axios.get(`${COMFY_URL}/history/${promptID}`);

        const history = response.data;

        if (history[promptID]) {
            console.log("Generation complete!");

            return history[promptID];
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
    }
}

function extractImage(history) {
    const outputs = history.outputs;

    for (const nodeID in outputs) {
        const node = outputs[nodeID];

        if (node.images) {
            return node.images[0];
        }
    }

    return null;
}

module.exports = {
    queueWorkflow,
    waitForCompletion,
    extractImage,
};
