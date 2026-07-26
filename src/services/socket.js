let io;

function init(socketServer) {
    io = socketServer;
}

function sendStatus(message) {
    if (io) {
        io.emit("status", message);
    }
}

function sendProgress(percent) {
    if (io) {
        io.emit("progress", percent);
    }
}

function sendPrompt(prompt) {
    io.emit("prompt", prompt);
}

function sendGenerationStarted() {
    io.emit("generation-started", "");
}

function sendDiceFeed(event) {
    if (io) {
        io.emit("dice-feed", event);
    }
}

module.exports = {
    init,
    sendStatus,
    sendProgress,
    sendPrompt,
    sendGenerationStarted,
    sendDiceFeed,
};
