const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const deployRoutes = require("./routes/deployRoutes"); // Import deployment routes

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Mount the deployment routes
app.use("/api/deploy", deployRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Backend running on port ${PORT}");
});
