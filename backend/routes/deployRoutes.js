const express = require("express");
const { buildAndPushDockerImage } = require("../controllers/deployController");
const router = express.Router();

// Route for building and pushing Docker image
router.post("/", buildAndPushDockerImage);

module.exports = router;
