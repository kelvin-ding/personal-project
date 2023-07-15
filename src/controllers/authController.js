const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const moment = require("moment");
const requestIp = require("request-ip");
const { validationResult } = require("express-validator");
const {
  User,
  IP_Address,
  RefreshToken,
  Verification_Code,
} = require("../models/v1");
const {
  generateVerificationCode,
  loginUser,
} = require("../utils/auth/verificationCode");
const sendEmail = require("../utils/email/sendEmail");

// Verify Login Code
exports.verifyLogin = async (req, res) => {
  const { code, user_id } = req.body;

  // Find the verification code record
  const verificationCodeRecord = await Verification_Code.findOne({
    where: { user_id: user_id, code: code },
  });

  if (!verificationCodeRecord || verificationCodeRecord.used) {
    return res.status(400).json({
      status: "error",
      data: { msg: "Invalid or used verification code" },
    });
  }

  // Check if the code has expired
  const now = new Date();
  if (verificationCodeRecord.expires_at < now) {
    return res.status(400).json({
      status: "error",
      data: { msg: "Verification code has expired" },
    });
  }

  // Check if the code is for login verification
  if (verificationCodeRecord.verification_type !== "login") {
    return res.status(400).json({
      status: "error",
      data: { msg: "Verification code type mismatch" },
    });
  }

  // Login the user
  try {
    const user = await User.findOne({
      where: { id: user_id },
    });
    await loginUser(user, res); // Wait for loginUser to complete before continuing

    // Delete the verification code after successful login
    await Verification_Code.destroy({
      where: { id: verificationCodeRecord.id },
    });

    // res.json has already been called in loginUser
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: "error",
      data: { msg: "Server error" },
    });
  }
};

// exports.googleLogin = passport.authenticate("google", {
//   scope: ["profile", "email"],
// });

// exports.googleRedirect = (req, res) => {
//   // Handle what happens after successful Google login here
// };

// exports.facebookLogin = passport.authenticate("facebook");

// exports.facebookRedirect = (req, res) => {
//   // Handle what happens after successful Facebook login here
// };

// Login
exports.login = async (req, res, next) => {
  const { email, phonenumber, password } = req.body;
  const ip = requestIp.getClientIp(req); // Get the client's IP address

  try {
    // Find the user either by email or phone number
    let user = await User.findOne({
      where: { $or: [{ email: email }, { phonenumber: phonenumber }] },
    });

    // Throw error if user not found
    if (!user) {
      return res.status(400).json({
        status: "error",
        data: "Account not registered",
      });
    }

    // Compare the incoming password with the database password
    const isMatch = await bcrypt.compare(password, user.password);

    // Check if the password is correct
    if (!isMatch) {
      user.loginAttempts += 1;
      await user.save();

      // Lock account if login attempts exceed limit
      if (user.loginAttempts >= 15) {
        user.lockUntil = Date.now() + 24 * 60 * 60 * 1000; // 24 hours from now
        await user.save();
      }

      return res.status(400).json({
        status: "error",
        data: "Invalid password.",
      });
    }

    // Check if account is locked
    if (user.lockUntil && Date.now() < user.lockUntil) {
      return res.status(400).json({
        status: "error",
        data: "This account has been locked due to too many failed login attempts. Please try again later.",
      });
    }

    // Reset login attempts and lock if password is correct
    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    // Check for a change in IP address
    const ipRecord = await IpAddress.findOne({ where: { user_id: user.id } });

    if (ipRecord.ip !== ip) {
      // If there's a change in IP, generate and send verification code
      const verificationCode = 123;
      await VerificationCode.create({
        code: verificationCode,
        user_id: user.id,
      });

      // Send the verification code via the method chosen by the user
      if (user.isEmailVerified) {
        await sendVerificationCode(user.email, verificationCode);
      } else if (user.isPhonenumberVerified) {
        await sendVerificationCode(user.phonenumber, verificationCode);
      }

      return res.status(200).json({
        status: "success",
        data: "A verification code has been sent to your email or phonenumber. Please enter the verification code to continue.",
      });
    }

    // If the IP address has not changed, generate JWT token and refresh token, save refresh token to the database
    loginUser(user, res);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.logout = (req, res, next) => {
  // Logout code here
};

exports.confirmEmail = (req, res, next) => {
  // Email confirmation code here
};

exports.forgotPassword = (req, res, next) => {
  // Forgot password code here
};
