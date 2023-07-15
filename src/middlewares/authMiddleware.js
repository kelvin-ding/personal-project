const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Get token from header
  const token = req.header("Authorization");

  // Check if no token
  if (!token) {
    return res.status(400).json({
      status: "error",
      data: { msg: "No token, authorization denied" },
    });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // add user info to request object
    next();
  } catch (err) {
    res.status(401).json({
      status: "error",
      data: { msg: "Token is not valid" },
    });
  }
};

module.exports = authMiddleware;
