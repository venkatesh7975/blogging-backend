const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const randomize = require("randomatic");
require("dotenv").config(); // Load environment variables

// Function to send OTP to the user's email
async function sendOtpEmail(email, otp) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "OTP Verification",
      text: `Your OTP is: ${otp}`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending OTP email:", error);
  }
}

// Function to send password reset email
async function sendResetEmail(email, token) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const resetUrl = `http://localhost:3000/reset-password?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Password Reset Request",
      text: `To reset your password, please click the following link: ${resetUrl}`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Reset email sent: " + info.response);
  } catch (error) {
    console.error("Error sending reset email:", error);
  }
}

// Registration endpoint
exports.register = async (req, res) => {
  const { email, password, username } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

    const newUser = new User({ email, username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Registration successful",
    });
  } catch (error) {
    console.error("Error during registration:", error.message);
    res.status(500).json({
      success: false,
      message: "An error occurred during registration",
    });
  }
};

// Login endpoint
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password); // Compare passwords
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const generatedOtp = randomize("0", 6);
    user.otp = generatedOtp;
    await user.save();

    await sendOtpEmail(email, generatedOtp);

    res.json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).json({
      success: false,
      message: "An error occurred during login",
    });
  }
};

// OTP Verification endpoint
exports.verifyOtp = async (req, res) => {
  const { otp } = req.body;

  try {
    const user = await User.findOne({ otp });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    user.otp = ""; // Clear OTP after successful verification
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      success: true,
      token,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Error during OTP verification:", error.message);
    res.status(500).json({
      success: false,
      message: "An error occurred during OTP verification",
    });
  }
};

// Request Password Reset endpoint
exports.requestReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Email not found",
      });
    }

    const token = jwt.sign({ email }, process.env.RESET_TOKEN_SECRET, {
      expiresIn: "1h",
    });
    await sendResetEmail(email, token);

    res.json({
      success: true,
      message: "Password reset email sent",
    });
  } catch (error) {
    console.error("Error requesting password reset:", error.message);
    res.status(500).json({
      success: false,
      message: "An error occurred while requesting password reset",
    });
  }
};

// Reset Password endpoint
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.RESET_TOKEN_SECRET);
    const { email } = decoded;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid token",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10); // Hash the new password

    user.password = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password successfully updated",
    });
  } catch (error) {
    console.error("Error resetting password:", error.message);
    res.status(500).json({
      success: false,
      message: "An error occurred while resetting the password",
    });
  }
};
