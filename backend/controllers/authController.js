const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validateRegister, validateLogin } = require("../utils/validator");

exports.register = async (req, res) => {
  const { username, password } = req.body;

  // Validate input
  const { error } = validateRegister(req.body);
  if (error) return res.status(400).json({ msg: error.details[0].message });

  try {
    // Check if user already exists
    let user = await User.findOne({ username });
    if (user) return res.status(400).json({ msg: "User already exists" });

    // Create a new user (remove manual password hashing as it's handled by the model middleware)
    user = new User({ username, password });
    await user.save();

    // Generate a JWT token
    const payload = { user: { id: user.id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ token });
      }
    );
  } catch (err) {
    console.error("Registration error:", err.message);
    res.status(500).send("Server error");
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  // Validate input
  const { error } = validateLogin(req.body);
  if (error) return res.status(400).json({ msg: error.details[0].message });

  try {
    // Check if user exists
    let user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // Generate a JWT token
    const payload = { user: { id: user.id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).send("Server error");
  }
};
