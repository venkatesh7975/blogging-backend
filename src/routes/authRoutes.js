const express = require("express");
const {
  register,
  login,
  verifyOtp,
  requestPasswordReset,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();

// User registration route
router.post("/register", register);

// User login route
router.post("/login", login);

// OTP verification route
router.post("/verify-otp", verifyOtp);

// Request password reset route
router.post("/request-reset", requestPasswordReset);

// Reset password route
router.post("/reset-password", resetPassword);

module.exports = router;
