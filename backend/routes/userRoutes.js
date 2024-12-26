const express = require("express");
const User = require("../models/User");
const Deployment = require("../models/Deployment");
const router = express.Router();

// Fetch user profile (name + number of deployments)
router.get("/profile", async (req, res) => {
  try {
    const userId = req.userId; // Get the userId from the request
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get the number of deployments for the user
    const deploymentsCount = await Deployment.countDocuments({ userId });

    res.status(200).json({
      name: user.name,
      deploymentsCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Fetch all deployments for the user
router.get("/deployments", async (req, res) => {
  try {
    const userId = req.userId; // Get the userId from the request
    const deployments = await Deployment.find({ userId }).sort({
      timestamp: -1,
    }); // Sort by newest deployment

    res.status(200).json(deployments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
