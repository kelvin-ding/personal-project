const register = require("./register");
const login = require("./login");
const refreshToken = require("./refreshToken");
const verifyPhone = require("./verifyPhone");
const verifyEmail = require("./verifyEmail");
const verifyLogin = require("./verifyLogin");
module.exports = {
  register,
  refreshToken,
  verifyPhone,
  verifyEmail,
  login,
  verifyLogin,
};
