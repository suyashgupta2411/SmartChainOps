const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { buildAndPushDockerImage } = require("../controllers/deployController");

// Test route to verify auth
router.get("/test", auth, (req, res) => {
  res.json({ msg: "Auth working", userId: req.user.id });
});

// Deployment route
router.post("/", auth, buildAndPushDockerImage);

module.exports = router;
