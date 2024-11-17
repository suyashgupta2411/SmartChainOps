const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { exec } = require("child_process");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// API Endpoint for Cloning Repo and Deploying
app.post("/api/deploy", (req, res) => {
  const { repoUrl } = req.body;
  const localPath = `/tmp/${Date.now()}`;

  exec(`git clone ${repoUrl} ${localPath}`, (cloneErr) => {
    if (cloneErr) {
      return res.status(500).json({ error: "Failed to clone repository." });
    }

    res.json({
      message: "Repository cloned successfully. Ready for deployment.",
      path: localPath,
    });
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
