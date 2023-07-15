const jwt = require("jsonwebtoken");
const { RefreshToken } = require("../../../models/v1");
const requestIp = require("request-ip");
const moment = require("moment");
const createError = require("../../../utils/error/createError");

module.exports = async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return next(createError("Access denied, token missing!", 403));
  } else {
    const token = await RefreshToken.findOne({
      where: { token: refreshToken },
    });
    if (!token) {
      return next(createError("Token is not valid or has expired!", 403));
    }
    try {
      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, userPayload) => {
          if (err)
            return next(createError("Token is not valid or has expired!", 403));

          // Revoke the used refresh token
          await RefreshToken.destroy({ where: { token: refreshToken } });

          // Get user's IP address and user agent
          const ip_address = requestIp.getClientIp(req);
          const user_agent = req.headers["user-agent"];

          // Prepare a new payload for the access and refresh tokens without the "exp" field
          const newPayload = {
            id: userPayload.id,
            email: userPayload.email,
          };

          // Generate new access token and refresh token
          const newAccessToken = jwt.sign(newPayload, process.env.JWT_SECRET, {
            expiresIn: "5h",
          });
          const newRefreshToken = jwt.sign(
            newPayload,
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "7d" } // refresh tokens are typically longer-lived
          );

          // Save the new refresh token in the database
          await RefreshToken.create({
            token: newRefreshToken,
            user_id: userPayload.id,
            ip_address,
            user_agent,
            expires_at: moment().add(7, "days").toDate(), // expires in 7 days
          });

          return res.status(200).json({
            success: true,
            data: {
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
            },
          });
        }
      );
    } catch (err) {
      return next(createError(err.message, 500));
    }
  }
};
