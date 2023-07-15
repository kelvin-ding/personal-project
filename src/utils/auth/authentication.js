const jwt = require("jsonwebtoken");
const { User } = require("../../models/v1");

const loginUser = async (user, res) => {
  // Reset login attempts and lock if password is correct
  user.loginAttempts = 0;
  user.lockUntil = null;
  await user.save();

  // JWT payload
  const payload = {
    user: {
      id: user.id,
    },
  };

  // Create a new promise
  return new Promise((resolve, reject) => {
    // JWT and refresh token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "5h" },
      async (err, token) => {
        if (err) {
          reject(err); // Reject the promise if there's an error
        } else {
          res.json({ status: "success", token });
          resolve(); // Resolve the promise once the response has been sent
        }
      }
    );
  });
};

module.exports = loginUser;
