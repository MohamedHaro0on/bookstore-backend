import jwt from "jsonwebtoken";
import UserModel from "../model/user.model.js";
import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import GetByIdHandler from "../../../utils/factory/get.by.id.handler.js";
import createHandler from "../../../utils/factory/create.handler.js";
import GetHandler from "../../../utils/factory/get.handler.js";
import generateTokens from "../../../utils/generate.tokens.js";
import RefreshTokenModel from "../../refresh_token/model/refresh_token.model.js";

// Register a new user
const register = createHandler(UserModel);

// Login user
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email });
  if (!user) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Invalid credentials" });
  }
  const isMatch = await user.verifyPassword(password);

  if (!isMatch) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Invalid credentials" });
  }
  const tokens = await generateTokens(user._id, user.role);

  // Set refresh token as HTTP-only cookie
  res.cookie("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    expires: tokens.expiryDate,
  });

  res.status(StatusCodes.ACCEPTED).json({
    message: "Login successful",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
    expires: tokens.expiryDate,
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

  await RefreshTokenModel.findOneAndDelete({ token: refreshToken });

  // Clear the refresh token cookie
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  res.status(StatusCodes.ACCEPTED).json({ message: "Logged out successfully" });
});

// Get current user
const getUserById = GetByIdHandler(UserModel);

const getUsers = GetHandler(UserModel);

export { register, login, refreshToken, logout, getUserById, getUsers };
