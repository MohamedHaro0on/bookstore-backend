import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import RefreshTokenModel from '../modules/refresh_token/model/refresh_token.model.js';
import process from 'process';
import ApiError from '../utils/api.error.js';

// Helper function to generate a new access token
const generateNewAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY
  });
};

const validateRefreshToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const storedToken = await RefreshTokenModel.findOne({
      userId: decoded.userId,
      token: refreshToken
    });
    if (!storedToken) {
      console.log(storedToken);
      await RefreshTokenModel.deleteMany({
        userId: decoded.userId
      });
      return false;
    }
    return decoded;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// Middleware to authenticate user
const authenticateUser = async (req, res, next) => {
  try {
    console.log("this is the check")
    // Extract access token from Authorization header
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

    // Extract refresh token from cookies
    const refreshToken = req.cookies?.refreshToken;
    let accessTokenDecodedUser = null;
    let refreshTokenDecodedUser = null;

    // If no tokens are provided, deny access
    if (!accessToken && !refreshToken) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: 'Authentication token is required' });
    }
    if (accessToken && refreshToken) {
      // authenticate user with refresh token and generate new access token
      console.log("this is the  check :")
      try {
        accessTokenDecodedUser = jwt.verify(
          accessToken,
          process.env.ACCESS_TOKEN_SECRET
        );
        refreshTokenDecodedUser = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET
        );
        // user is trying to use someone else's token
        if (accessTokenDecodedUser.userId !== refreshTokenDecodedUser.userId) {
          return next(ApiError('Refresh Token reuse detected . all sessions have been terminated for security .', StatusCodes.UNAUTHORIZED));
        }
        const isRefreshTokenValid = await validateRefreshToken(refreshToken);
        if (!isRefreshTokenValid) {
          return next(ApiError('Refresh Token reuse detected . all sessions have been terminated for security .', StatusCodes.UNAUTHORIZED));
        }
        console.log("this is the access token decoded user : ", accessTokenDecodedUser)
        req.user = accessTokenDecodedUser;
        req.body.user = accessTokenDecodedUser.userId
        return next();
      } catch (error) {
        console.log(error);
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ message: 'Refresh token has expired' });
      }
    }

    // validate the refresh token
    if (refreshToken) {
      console.log("this is the check")
      try {
        // Verify refresh token
        refreshTokenDecodedUser = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET
        );

        // Check if refresh token exists in the database
        const isRefreshTokenValid = await validateRefreshToken(refreshToken);
        if (!isRefreshTokenValid) {
          return res.status(StatusCodes.UNAUTHORIZED).json({
            message:
              'Refresh token reuse detected. All sessions have been terminated for security.'
          });
        }
        // Generate a new access token
        const newAccessToken = generateNewAccessToken(
          refreshTokenDecodedUser.userId
        );
        res.setHeader('Authorization', `Bearer ${newAccessToken}`);
        req.user = refreshTokenDecodedUser;
        console.log("this is the refresh token user : ", refreshTokenDecodedUser.userId)
        req.body.user = refreshTokenDecodedUser.userId

        return next();
      } catch (error) {
        console.log(error);
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ message: 'Refresh token has expired' });
      }
    } else {
      // the user has access token but not refresh token
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: 'Refresh token is required Please login again'
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Internal server error' });
  }
};

export default authenticateUser;
