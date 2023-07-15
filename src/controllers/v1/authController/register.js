// External dependencies
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const requestIp = require("request-ip");
const { validationResult } = require("express-validator");

// Internal dependencies
const {
  User,
  IP_Address,
  RefreshToken,
  Verification_Code,
} = require("../../../models/v1");
const {
  generateVerificationCode,
} = require("../../../utils/auth/verificationCode");
// Somewhere at the top of your register.js file, import your utility function
const createError = require("../../../utils/error/createError");
const generateTokens = require("../../../utils/auth/generateTokens");
const sendEmail = require("../../../utils/email/sendEmail");

// Register
module.exports = async (req, res, next) => {
  // Input validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(createError("Validation error", 400, errors.array()));
  }

  const {
    first_name,
    last_name,
    birthdate,
    phone_number,
    email,
    password,
    provider,
  } = req.body;

  let user;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return next(createError("User already registered", 409));
    }

    // Create a new user
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await User.create({
        first_name,
        last_name,
        birthdate,
        phone_number,
        email,
        password: hashedPassword,
        role: "reader", // Default role
      });
    } catch (err) {
      return next(createError("Failed to hash password or create user", 500));
    }

    // Record the user's IP address
    const clientIp = requestIp.getClientIp(req);
    try {
      await IP_Address.create({
        user_id: user.id,
        ip_address: clientIp,
      });
    } catch (err) {
      return next(createError("Failed to record user's IP address", 500));
    }

    // // Generate and store a verification code for email
    // const verificationCode = generateVerificationCode();
    // try {
    //   await Verification_Code.create({
    //     user_id: user.id,
    //     code: verificationCode,
    //     verification_type: "email",
    //     expiration: moment().add(5, "minutes").toDate(),
    //     used: false,
    //   });
    // } catch (err) {
    //   return next(
    //     createError("Failed to generate or store verification code", 500)
    //   );
    // }

    // // Send the verification email
    // sendEmail(
    //   user.email,
    //   "Email Confirmation",
    //   { email: user.email, name: user.last_name, code: verificationCode },
    //   "VerifyEmail"
    // ).catch((err) => {
    //   console.error(`Failed to send verification email to ${user.email}`, err);
    // });

    // Generate and store a verification token for email
    const emailVerificationToken = jwt.sign(
      { user: { id: user.id } },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    try {
      await Verification_Code.create({
        user_id: user.id,
        token: emailVerificationToken,
        verification_type: "email",
        expiration: moment().add(24, "hours").toDate(), // The token will be valid for 24 hours
        used: false,
      });
    } catch (err) {
      return next(
        createError("Failed to generate or store verification token", 500)
      );
    }

    // Create a URL with the verification token as a parameter
    const emailVerificationURL = `${process.env.CLIENT_URL}/verify-email?token=${emailVerificationToken}`;

    // Send the verification email
    //Parameter (Send email address, Subject Email, Payload email, Templete Email)
    sendEmail(
      user.email,
      "Email Confirmation",
      { email: user.email, name: user.last_name, url: emailVerificationURL },
      "VerifyEmail"
    ).catch((err) => {
      console.error(`Failed to send verification email to ${user.email}`, err);
    });

    // Generate tokens
    const payload = { id: user.id, email: user.email };
    const tokens = await generateTokens(
      payload,
      clientIp,
      req.headers["user-agent"]
    );

    // Send the success response
    res.json({
      status: "success",
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        msg: "Registration successful",
        user: { ...user.dataValues, password: undefined }, // Exclude the password
      },
    });
  } catch (err) {
    next(err); // Forward any errors to error handler
  }
};
