const Deployment = require("../models/Deployment");

exports.createDeployment = async (req, res) => {
  try {
    const { repoUrl } = req.body;
    const newDeployment = new Deployment({
      user: req.user.id,
      repoUrl,
    });
    await newDeployment.save();
    res.json(newDeployment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.getDeployments = async (req, res) => {
  try {
    const deployments = await Deployment.find({ user: req.user.id });
    res.json(deployments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
