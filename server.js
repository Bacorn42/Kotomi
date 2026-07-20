const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const imageRoutes = require("./src/routes/image");
const aiRoutes = require("./src/routes/ai");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

require("./src/services/socket").init(io);

const PORT = 3000;

// Allow JSON requests
app.use(express.json());

// Serve website files
app.use(express.static("public"));
app.use("/generated", express.static("data/images"));

// Serve website routes
app.use("/api/image", imageRoutes);
app.use("/api/ai", aiRoutes);

// Test route
app.get("/api/test", (req, res) => {
    res.json({
        message: "Kotomi API is working!",
    });
});

// Sockets
io.on("connection", (socket) => {
    console.log("Kotomi client connected");

    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`Kotomi running at http://localhost:${PORT}`);
});
