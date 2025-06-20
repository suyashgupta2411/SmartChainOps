const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // Get token from header
  let token = req.header("x-auth-token");

  // Also check Authorization header for Bearer token
  if (!token && req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    console.log("No token found in headers:", req.headers);
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    console.log("Token verification failed:", err.message);
    res.status(401).json({ msg: "Token is not valid" });
  }
};
