const express = require("express");
const {
  register,
  login,
  verifyOtp,
  requestReset,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();

// Registration endpoint
router.post("/register", register);

// Login endpoint
router.post("/login", login);

// OTP Verification endpoint
router.post("/verify-otp", verifyOtp);

// Request Password Reset endpoint
router.post("/request-reset", requestReset);

// Reset Password endpoint
router.post("/reset-password", resetPassword);

module.exports = router;
