const express = require("express");
const {
  createDeployment,
  getDeployments,
} = require("../controllers/deploymentController");
const router = express.Router();

router.post("/", createDeployment);
router.get("/", getDeployments);

module.exports = router;
