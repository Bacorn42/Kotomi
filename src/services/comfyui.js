const axios = require("axios");
const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");
const crypto = require("crypto");

const socket = require("./socket");

const COMFY_URL = "http://127.0.0.1:8188";
const COMFY_WS = COMFY_URL.replace("http", "ws");

function loadWorkflow() {
    const workflowPath = path.join(
        __dirname,
        "../../modules/image-generation/img_gen_z-image_turbo.json",
    );

    return JSON.parse(fs.readFileSync(workflowPath, "utf8"));
}

async function queueWorkflow(prompt, settings) {
    const workflow = loadWorkflow();
    const clientID = crypto.randomUUID();

    const seed = applySettings(workflow, prompt, settings);

    const response = await axios.post(`${COMFY_URL}/prompt`, {
        prompt: workflow,
        client_id: clientID,
    });

    return {
        promptID: response.data.prompt_id,
        clientID: clientID,
        seed,
    };
}

function applySettings(workflow, prompt, settings) {
    workflow["2"].inputs.text = prompt;

    workflow["4"].inputs.width = settings.width;
    workflow["4"].inputs.height = settings.height;

    workflow["10"].inputs.width = settings.width;
    workflow["10"].inputs.height = settings.height;

    const seed = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    workflow["5"].inputs.steps = settings.steps;
    workflow["5"].inputs.seed = seed;

    return seed;
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

function listenForProgress(promptID, clientID) {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(`${COMFY_WS}/ws?clientId=${clientID}`);

        ws.on("open", () => {
            console.log("Connected to ComfyUI websocket");
        });

        ws.on("message", (data) => {
            let message;
            try {
                message = JSON.parse(data.toString());
            } catch (error) {
                return;
            }

            if (message.type === "progress") {
                const value = message.data.value;
                const max = message.data.max;
                const percent = Math.round((value / max) * 100);

                console.log(`ComfyUI: ${percent}%`);
                socket.sendProgress(percent);
            }

            if (message.type === "executing") {
                if (message.data.node === null && message.data.prompt_id === promptID) {
                    console.log("ComfyUI finished");
                    ws.close();
                    resolve();
                }
            }
        });

        ws.on("error", reject);
    });
}

async function getImage(filename) {
    return await axios.get(`${COMFY_URL}/view`, {
        params: {
            filename,
            type: "output",
        },

        responseType: "stream",
    });
}

async function interrupt() {
    await axios.post(`${COMFY_URL}/interrupt`);
}

module.exports = {
    queueWorkflow,
    waitForCompletion,
    extractImage,
    listenForProgress,
    getImage,
    interrupt,
};
