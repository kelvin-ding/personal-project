const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const moment = require("moment");
const requestIp = require("request-ip");
const generateTokens = require("../../../utils/auth/generateTokens");

const {
  User,
  Verification_Code,
  IP_Address,
  RefreshToken,
} = require("../../../models/v1");
const {
  generateVerificationCode,
} = require("../../../utils/auth/verificationCode");
const createError = require("../../../utils/error/createError");
const sendEmail = require("../../../utils/email/sendEmail");

module.exports = async (req, res, next) => {
  // Input validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(createError("Validation error", 400, errors.array()));
  }

  const { identifier, password } = req.body;
  const currentIP = requestIp.getClientIp(req);

  let user;
  if (identifier.includes("@")) {
    user = await User.findOne({ where: { email: identifier } });
  } else {
    user = await User.findOne({ where: { phone_number: identifier } });
    if (!user.phone_verified) {
      return next(createError("Phone number not verified", 400));
    }
  }

  if (!user) {
    return next(createError("User not found", 404));
  }

  const currentTime = new Date();

  if (user.lock_until && currentTime < user.lock_until) {
    const lockDurationMessage = getLockDurationMessage(
      user.lock_until,
      currentTime
    );
    return next(
      createError(
        `Your account is locked due to multiple failed login attempts. Please try again in ${lockDurationMessage}.`,
        403
      )
    );
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    await incrementFailedLogins(user);
    return next(createError("Invalid password", 400));
  }

  user.login_attempts = 0;
  await user.save();

  const ipRecord = await IP_Address.findOne({
    where: { user_id: user.id },
    order: [["createdAt", "DESC"]],
  });

  if (!ipRecord || ipRecord.ip_address !== currentIP) {
    const verificationCode = generateVerificationCode();

    await Verification_Code.create({
      user_id: user.id,
      code: verificationCode,
      verification_type: "login",
      expiration: moment().add(5, "minutes").toDate(),
      used: false,
    });

    if (identifier.includes("@")) {
      sendEmail(
        user.email,
        "Login Verification",
        { email: user.email, name: user.last_name, code: verificationCode },
        "LoginVerification"
      ).catch((err) => {
        console.error(
          `Failed to send verification email to ${user.email}`,
          err
        );
      });
    } else if (user.phone_verified) {
      sendMessage(
        user.phone_number,
        `Your verification code is: ${verificationCode}`
      ).catch((err) => {
        console.error(
          `Failed to send verification SMS to ${user.phone_number}`,
          err
        );
      });
    }

    return res.status(200).json({
      status: "success",
      message:
        "A verification code has been sent to your email or phone number. Please verify to login.",
    });
  }

  const tokens = await generateTokens(
    { id: user.id, email: user.email },
    currentIP,
    req.headers["user-agent"]
  );

  res.json({
    status: "success",
    data: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      msg: "Login successful",
      user: { ...user.dataValues, password: undefined }, // Exclude the password
    },
  });
};

function getLockDurationMessage(lockUntil, current) {
  const lockDuration = Math.ceil(
    (lockUntil.getTime() - current.getTime()) / 1000 / 60
  ); // Convert milliseconds to minutes
  if (lockDuration < 60) {
    return `${lockDuration} minutes`;
  } else if (lockDuration < 24 * 60) {
    return `${Math.ceil(lockDuration / 60)} hours`;
  } else {
    return `${Math.ceil(lockDuration / 60 / 24)} days`;
  }
}

async function incrementFailedLogins(user) {
  const login_attempts = user.login_attempts + 1;
  let lock_until = null;
  if (login_attempts === 5) {
    lock_until = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now.
  } else if (login_attempts === 10) {
    lock_until = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now.
  } else if (login_attempts === 15) {
    lock_until = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now.
  }
  // Updating the login_attempts and lock_until in the database
  await User.update({ login_attempts, lock_until }, { where: { id: user.id } });
}
