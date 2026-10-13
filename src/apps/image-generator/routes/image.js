const express = require("express");
const axios = require("axios");
const generator = require("../core/generator");
const comfyui = require("../services/comfyui");
const imageRepository = require("../repositories/imageRepository");
const { requireLogin } = require("../../../middleware/auth");

const router = express.Router();

router.post("/generate", requireLogin, async (req, res) => {
    try {
        const { prompt, model, enhancePrompt, settings } = req.body;

        if (!prompt) {
            return res.status(400).json({
                success: false,
                error: "Prompt is required.",
            });
        }

        const result = await generator.generate(
            req.user.UserID,
            prompt,
            model,
            enhancePrompt,
            settings,
        );

        res.json(result);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

router.get("/view", async (req, res) => {
    try {
        const filename = req.query.filename;

        const response = await comfyui.getImage(filename);

        res.setHeader("Content-Type", response.headers["content-type"]);

        response.data.pipe(res);
    } catch (error) {
        console.error(error);

        res.status(500).send("Could not retrieve image");
    }
});

router.post("/cancel", async (req, res) => {
    try {
        await comfyui.interrupt();
        res.json({
            success: true,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: error.message,
        });
    }
});

router.get("/history", requireLogin, (req, res) => {
    try {
        const images = imageRepository.getRecent(req.user.UserID);
        res.json(images);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Unable to retrieve image history.",
        });
    }
});

router.get("/:id", requireLogin, (req, res) => {
    try {
        const image = imageRepository.getByIdAndUser(req.params.id, req.user.UserID);

        if (!image) {
            return res.status(404).json({
                error: "Image not found.",
            });
        }

        res.json(image);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Unable to retrieve image.",
        });
    }
});

router.post("/bulk-delete", requireLogin, async (req, res) => {
    const { imageIds } = req.body;

    if (
        !Array.isArray(imageIds) ||
        imageIds.length === 0 ||
        imageIds.length > 50 ||
        !imageIds.every(
            (id) =>
                (typeof id === "number" || typeof id === "string") &&
                String(id).trim() !== "" &&
                Number.isSafeInteger(Number(id)) &&
                Number(id) > 0,
        )
    ) {
        return res.status(400).json({
            error: "Provide between 1 and 50 valid image IDs.",
        });
    }

    const uniqueIds = [...new Set(imageIds.map(String))];
    const deleted = [];
    const failed = [];

    for (const imageId of uniqueIds) {
        try {
            const image = imageRepository.getByIdAndUser(imageId, req.user.UserID);

            if (!image) {
                failed.push({
                    imageId,
                    error: "Image not found.",
                });
                continue;
            }

            await comfyui.deleteImage(image.Filename);

            const result = imageRepository.deleteById(image.ImageID, req.user.UserID);

            if (result.changes === 0) {
                failed.push({
                    imageId,
                    error: "Database record was not deleted.",
                });
                continue;
            }

            deleted.push(imageId);
        } catch (error) {
            console.error(`Failed to delete image ${imageId}:`, error);

            failed.push({
                imageId,
                error:
                    error.code === "ENOENT"
                        ? "Image file was not found on disk; database record was preserved."
                        : "Unable to delete image.",
            });
        }
    }

    res.json({
        success: failed.length === 0,
        deleted,
        failed,
    });
});

router.delete("/:id", requireLogin, async (req, res) => {
    try {
        const image = imageRepository.getByIdAndUser(req.params.id, req.user.UserID);

        if (!image) {
            return res.status(404).json({
                error: "Image not found.",
            });
        }

        await comfyui.deleteImage(image.Filename);

        const result = imageRepository.deleteById(image.ImageID, req.user.UserID);

        if (result.changes === 0) {
            return res.status(404).json({
                error: "Image not found.",
            });
        }

        res.json({
            success: true,
        });
    } catch (error) {
        if (error.code === "ENOENT") {
            console.error("Image file missing from disk:", error.message);

            return res.status(500).json({
                error: "Image file was not found on disk. The database record was preserved.",
            });
        }

        console.error(error);

        res.status(500).json({
            error: "Unable to delete image.",
        });
    }
});

module.exports = router;
