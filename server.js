const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");

const imageRoutes = require("./src/routes/image");
const aiRoutes = require("./src/routes/ai");
const authRoutes = require("./src/routes/auth");
const diceRoutes = require("./src/routes/dice");
const achievementRoutes = require("./src/routes/achievements");
const itemsRoutes = require("./src/routes/items");
const shopRoutes = require("./src/routes/shop");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
require("./src/services/socket").init(io);

require("./src/database/db");
const { seedAchievements } = require("./src/database/seedAchievements.js");
const seedItems = require("./src/database/seedItems.js");
const { seedUpgrades } = require("./src/database/seedUpgrades.js");

seedAchievements();
seedItems();
seedUpgrades();

const PORT = 3000;

// Allow JSON requests
app.use(express.json());
app.use(cookieParser());

// Serve website files
app.use(express.static("public"));
app.use("/generated", express.static("data/images"));

// Serve website routes
app.use("/api/image", imageRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dice", diceRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/items", itemsRoutes);
app.use("/api/shop", shopRoutes);

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
