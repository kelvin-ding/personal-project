const jwt = require("jsonwebtoken");
const moment = require("moment");
const { RefreshToken } = require("../../models/v1");

async function generateTokens(payload, ip, userAgent) {
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  await RefreshToken.create({
    token: refreshToken,
    user_id: payload.id,
    ip_address: ip,
    user_agent: userAgent,
    expires_at: moment().add(7, "days").toDate(),
  });

  return { accessToken, refreshToken };
}

module.exports = generateTokens;
