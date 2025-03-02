import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import User from "../model/user.model.js";
import Token from "../../refresh_token/model/refresh_token.model.js";
import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import GetByIdHandler from "../../../utils/factory/get.by.id.handler.js";

// Generate tokens
const generateTokens = async (userId) => {
  const payload = { userId };
  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
  const refreshToken = jwt.sign(
    { ...payload, jti: uuidv4() },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
  const decoded = jwt.decode(refreshToken);
  const expiryDate = new Date(decoded.exp * 1000);

  await Token.findOneAndDelete({ userId });
  await Token.create({
    userId,
    token: refreshToken,
    expires: expiryDate,
    isValid: true,
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: decoded.exp,
  };
};

// Register a new user
const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  const user = await User.create({
    username,
    email,
    password,
  });

  const tokens = await generateTokens(user._id);

  // Set refresh token as HTTP-only cookie
  res.cookie("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    sameSite: "Strict", // Adjust based on your needs
    expires: new Date(tokens.expiresIn * 1000), // Set cookie expiry
  });

  res.status(StatusCodes.CREATED).json({
    message: "User registered successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
    accessToken: tokens.accessToken,
  });
});

// Login user
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const tokens = await generateTokens(user._id);

  // Set refresh token as HTTP-only cookie
  res.cookie("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    expires: new Date(tokens.expiresIn * 1000),
  });

  res.status(StatusCodes.ACCEPTED).json({
    message: "Login successful",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
    accessToken: tokens.accessToken,
  });
});

// Refresh token
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies; // Get refresh token from cookies

  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

  const storedToken = await Token.findOne({
    userId: decoded.userId,
    token: refreshToken,
  });
  if (!storedToken) {
    return res.status(403).json({ message: "Invalid token" });
  }

  const tokens = await generateTokens(decoded.userId);

  // Set new refresh token as HTTP-only cookie
  res.cookie("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    expires: new Date(tokens.expiresIn * 1000),
  });

  res.status(StatusCodes.CREATED).json({
    message: "Token refreshed successfully",
    accessToken: tokens.accessToken,
  });
});

// Logout user
const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies; // Get refresh token from cookies

  await Token.findOneAndDelete({ token: refreshToken });

  // Clear the refresh token cookie
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  res.status(StatusCodes.ACCEPTED).json({ message: "Logged out successfully" });
});

// Get current user
const getUserById = GetByIdHandler(User);
export { register, login, refreshToken, logout, getUserById };
