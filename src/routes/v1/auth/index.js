const express = require("express");
const { check } = require("express-validator");
const router = express.Router();
const authMiddleware = require("../../../middlewares/authMiddleware");
const {
  register,
  refreshToken,
  verifyPhone,
  verifyEmail,
  verifyLogin,
  login,
} = require("../../../controllers/v1/authController");

router.post(
  "/register",
  [
    check("first_name", "Firstname is required")
      .not()
      .isEmpty()
      .isLength({ min: 3, max: 15 })
      .withMessage("Firstname must be between 3 and 30 characters long"),
    check("last_name", "Lastname is required")
      .not()
      .isEmpty()
      .isLength({ min: 3, max: 15 })
      .withMessage("Lastname must be between 3 and 30 characters long"),
    check("birthdate", "Birthdate is required")
      .not()
      .isEmpty()
      .isDate()
      .withMessage("Birthdate must be a valid date"),
    check("phone_number", "Phonenumber is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 10 }),
  ],
  register
);

router.post(
  "/login",
  [
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 10 }),
  ],
  login
);

// // Add this route for refreshing tokens
router.post("/refresh-token", authMiddleware, refreshToken);

router.post("/verify-phone", authMiddleware, verifyPhone);
router.get("/verify-email/:token", authMiddleware, verifyEmail);
router.post("/verify-login", verifyLogin);

// // router.get("/login/google", AuthController.googleLogin);
// // router.get("/login/google/redirect", AuthController.googleRedirect);

// // router.get("/login/facebook", AuthController.facebookLogin);
// // router.get("/login/facebook/redirect", AuthController.facebookRedirect);

// router.post("/login", AuthController.login);

// router.post("/logout", AuthController.logout);

// router.post("/confirm-email", AuthController.confirmEmail);

// router.post("/forgot-password", AuthController.forgotPassword);

module.exports = router;
