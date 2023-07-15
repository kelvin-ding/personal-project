const { User, Verification_Code } = require("../../../models/v1");
const createError = require("../../../utils/error/createError");

// Verify Email
module.exports = async (req, res, next) => {
  const { token } = req.params;

  // Find the verification token record
  const verificationCodeRecord = await Verification_Code.findOne({
    where: { token: token },
  });

  if (!verificationCodeRecord || verificationCodeRecord.used) {
    return next(createError("Invalid or used verification token", 400));
  }

  // Make sure the logged in user is the same as the user who is trying to verify their account
  if (req.user.id != verificationCodeRecord.user_id) {
    return next(createError("Forbidden", 403));
  }

  // Check if the token has expired
  const now = new Date();
  if (verificationCodeRecord.expires_at < now) {
    return next(createError("Verification token has expired", 400));
  }

  // Handle email verification
  try {
    await User.update(
      { email_verified: true },
      { where: { id: verificationCodeRecord.user_id } }
    );

    // Mark the verification token as used
    await Verification_Code.update(
      { used: true },
      {
        where: { id: verificationCodeRecord.id },
      }
    );

    res.json({
      status: "success",
      data: { msg: "Email verification successful" },
    });
  } catch (err) {
    next(createError(err.message, 500));
  }
};
