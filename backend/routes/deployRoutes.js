const express = require("express");
const {
  createDeployment,
  getDeployments,
} = require("../controllers/deployController");
const auth = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/create", auth, createDeployment);
router.get("/", auth, getDeployments);

module.exports = router;
