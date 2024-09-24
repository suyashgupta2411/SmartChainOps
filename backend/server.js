const express = require("express");
<<<<<<< HEAD
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const deploymentRoutes = require("./routes/deployment");

dotenv.config();
const app = express();

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

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/deploy", deploymentRoutes);

const PORT = process.env.PORT || 5000;
=======
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/deploy", require("./routes/deployRoutes"));

const PORT = process.env.PORT || 5000;

>>>>>>> be61c11 (Error resolve)
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
