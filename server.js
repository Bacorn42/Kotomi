const express = require("express");

const imageRoute = require("./src/routes/image");

const app = express();

const PORT = 3000;

// Allow JSON requests
app.use(express.json());

// Serve website files
app.use(express.static("public"));

// Serve website routes
app.use("/api/image", imageRoute);

// Test route
app.get("/api/test", (req, res) => {
    res.json({
        message: "Kotomi API is working!",
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Kotomi running at http://localhost:${PORT}`);
});
