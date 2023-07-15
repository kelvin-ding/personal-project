// Required modules
const {
  User,
  Verification_Code,
  IP_Address,
  RefreshToken,
} = require("../../../models/v1");
const moment = require("moment");
const createError = require("../../../utils/error/createError");
const requestIp = require("request-ip");
const sendEmail = require("../../../utils/email/sendEmail");
const generateTokens = require("../../../utils/auth/generateTokens");
// Verify endpoint controller
module.exports = async (req, res, next) => {
  const { user_id, code } = req.body;

  const verification = await Verification_Code.findOne({
    where: {
      user_id: user_id,
      code: code,
      used: false,
    },
    order: [["createdAt", "DESC"]], // Fetch the most recent verification code
  });

  if (!verification) {
    return next(createError("Invalid or expired code", 400));
  }

  const currentTime = new Date();
  if (currentTime > verification.expiration) {
    return next(createError("The code has expired", 400));
  }

  await verification.destroy(); // Delete the used verification code from the database

  const user = await User.findOne({ where: { id: user_id } });
  const currentIP = requestIp.getClientIp(req);

  // Send an email notification about the new login
  sendEmail(
    user.email,
    "New Device Login",
    {
      email: user.email,
      name: user.last_name,
      ip_address: currentIP,
      date: new Date(),
    },
    "NewDeviceLogin"
  ).catch((err) => {
    console.error(
      `Failed to send new device login email to ${user.email}`,
      err
    );
  });

  // Generate tokens
  const payload = { id: user.id, email: user.email };
  const tokens = await generateTokens(
    payload,
    currentIP,
    req.headers["user-agent"]
  );

  await IP_Address.create({ user_id: user.id, ip_address: currentIP });

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
