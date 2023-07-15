const { User, Verification_Code } = require("../../../models/v1");
const createError = require("../../../utils/error/createError");

// Verify Code
module.exports = async (req, res, next) => {
  const { code, user_id } = req.body;

  // Make sure the logged in user is the same as the user who is trying to verify their account
  if (req.user.id != user_id) {
    return next(createError("Forbidden", 403));
  }

  // Find the verification code record
  const verificationCodeRecord = await Verification_Code.findOne({
    where: { user_id: user_id, code: code },
  });

  if (!verificationCodeRecord || verificationCodeRecord.used) {
    return next(createError("Invalid or used verification code", 400));
  }

  // Check if the code has expired
  const now = new Date();
  if (verificationCodeRecord.expires_at < now) {
    return next(createError("Verification code has expired", 400));
  }

  // Handle verification based on the type
  try {
    switch (verificationCodeRecord.verification_type) {
      case "phone":
        // Handle phone verification
        // Probably you will set a flag in the User model indicating that the phone number is verified.
        await User.update({ phone_verified: true }, { where: { id: user_id } });
        break;

      default:
        // Unrecognized type - this should never happen if your code is correct
        throw new Error("Invalid verification type");
    }

    // Delete the verification code after successful verification
    await Verification_Code.destroy({
      where: { id: verificationCodeRecord.id },
    });

    res.json({
      status: "success",
      data: { msg: "Verification successful" },
    });
  } catch (err) {
    next(createError(err.message, 500));
  }
};
