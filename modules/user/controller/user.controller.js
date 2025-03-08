import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import createHandler from '../../../utils/factory/create.handler.js';
import getByIdHandler from '../../../utils/factory/get.by.id.handler.js';
import getHandler from '../../../utils/factory/get.handler.js';
import generateTokens from '../../../utils/generate.tokens.js';
import RefreshTokenModel from '../../refresh_token/model/refresh_token.model.js';
import UserModel from '../model/user.model.js';
import process from 'process';
import ApiError from '../../../utils/api.error.js';
import updateHandler from '../../../utils/factory/update.handler.js';


// Register a new user
const register = createHandler(UserModel);
// Get a specfic user :
const getById = getByIdHandler(UserModel);

const getAll = getHandler(UserModel);

const update = updateHandler(UserModel)

// Login user
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) {
    return next(new ApiError("Invalid Credentials", StatusCodes.UNAUTHORIZED));
  }
  const isMatch = await user.verifyPassword(password);

  if (!isMatch) {
    return next(new ApiError("Invalid Credentials", StatusCodes.UNAUTHORIZED));
  }
  const tokens = await generateTokens(user._id, user.role);
  // Set refresh token as HTTP-only cookie
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    expires: tokens.expiryDate
  });

  res.status(StatusCodes.ACCEPTED).json({
    message: 'Login successful',
    user,
    expires: tokens.expiryDate,
    accessToken: tokens.accessToken
  });
});

// Refresh token
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies; // Get refresh token from cookies

  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

  const storedToken = await Token.findOne({
    userId: decoded.userId,
    token: refreshToken
  });
  if (!storedToken) {
    return next(new ApiError("Token is not found", StatusCodes.UNAUTHORIZED));
  }

  const tokens = await generateTokens(decoded.userId);

  // Set new refresh token as HTTP-only cookie
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    expires: new Date(tokens.expiresIn * 1000)
  });

  res.status(StatusCodes.CREATED).json({
    message: 'Token refreshed successfully',
    accessToken: tokens.accessToken
  });
});

// Logout user
const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies; // Get refresh token from cookies

  await RefreshTokenModel.findOneAndDelete({ token: refreshToken });

  // Clear the refresh token cookie
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict'
  });

  res.status(StatusCodes.ACCEPTED).json({ message: 'Logged out successfully' });
});

// verfiy email
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const decodedToken = jwt.verify(token, process.env.EMAIL_SECRET_KEY);
  if (!decodedToken) {
    return next(new ApiError("Invalid Token", StatusCodes.UNAUTHORIZED));
  }

  const user = await UserModel.findOneAndUpdate({ email: decodedToken, isEmailVerfied: false }, { isEmailVerfied: true }, { new: true });
  if (!user) {
    return next(new ApiError("user is not found", StatusCodes.NOT_FOUND));
  }

  res.status(StatusCodes.ACCEPTED).json({ message: 'Email verified successfully' });
});

export { getById, getAll, login, logout, refreshToken, register, verifyEmail, update };
