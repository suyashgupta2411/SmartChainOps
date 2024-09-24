const Deployment = require("../models/Deployment");

// Create a new deployment
exports.createDeployment = async (req, res) => {
  try {
    const { repoUrl } = req.body;
    const deployment = new Deployment({
      user: req.user.id,
      repoUrl,
    });
    await deployment.save();
    // Trigger CI/CD pipeline here
    res.status(201).json(deployment);
  } catch (error) {
    res.status(500).json({ message: "Error creating deployment", error });
  }
};

// Get all deployments
exports.getDeployments = async (req, res) => {
  try {
    const deployments = await Deployment.find({ user: req.user.id });
    res.json(deployments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching deployments", error });
  }
};
