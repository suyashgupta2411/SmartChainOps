const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const jwt = require("jsonwebtoken");

// Initialize app and load environment variables
dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Import models and routes
const User = require("./models/User"); // User model
const Deployment = require("./models/Deployment"); // Deployment model

// Authentication middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access Denied" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid Token" });
    req.user = user; // Add user info to request
    next();
  });
};

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/deploy", require("./routes/deployRoutes"));

// Profile route to get user info and number of deployments
app.get("/api/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id); // Find user by JWT user ID
    if (!user) return res.status(404).json({ message: "User not found" });

    const deploymentsCount = await Deployment.countDocuments({
      userId: req.user.id,
    });

    res.status(200).json({
      name: user.name,
      email: user.email,
      deploymentsCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Route to fetch all deployments for the user
app.get("/api/deployments", authenticateToken, async (req, res) => {
  try {
    const deployments = await Deployment.find({ userId: req.user.id }).sort({
      timestamp: -1,
    });

    if (!deployments.length) {
      return res.status(404).json({ message: "No deployments found" });
    }

    res.status(200).json(deployments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
