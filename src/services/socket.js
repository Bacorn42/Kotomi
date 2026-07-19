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

module.exports = {
    init,
    sendStatus,
    sendProgress,
};
