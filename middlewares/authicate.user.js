import jwt from "jsonwebtoken";
import RefreshTokenModel from "../modules/refresh_token/model/refresh_token.model.js";
import { StatusCodes } from "http-status-codes";

// Helper function to generate a new access token
const generateNewAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
};

// Middleware to authenticate user
const authenticateUser = async (req, res, next) => {
  try {
    // Extract access token from Authorization header
    const authHeader = req.headers["authorization"];
    const accessToken = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    // Extract refresh token from cookies
    const refreshToken = req.cookies?.refreshToken;
    let accessTokenDecodedUser = null;
    let refreshTokenDecodedUser = null;

    // If no tokens are provided, deny access
    if (!accessToken && !refreshToken) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Authentication token is required" });
    }
    if (accessToken && refreshToken) {
      // authenticate user with refresh token and generate new access token
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
          return res.status(StatusCodes.UNAUTHORIZED).json({
            message: "Invalid access token",
          });
        }
        let isRefreshTokenValid = await validateRefreshToken(refreshToken);
        if (!isRefreshTokenValid) {
          return res.status(StatusCodes.UNAUTHORIZED).json({
            message:
              "Refresh token reuse detected. All sessions have been terminated for security.",
          });
        }
        req.user = accessTokenDecodedUser;
        return next();
      } catch (error) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ message: "Refresh token has expired" });
      }
    }
    // validate the refresh token
    if (refreshToken) {
      try {
        // Verify refresh token
        refreshTokenDecodedUser = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET
        );

        // Check if refresh token exists in the database
        let isRefreshTokenValid = await validateRefreshToken(refreshToken);
        if (!isRefreshTokenValid) {
          return res.status(StatusCodes.UNAUTHORIZED).json({
            message:
              "Refresh token reuse detected. All sessions have been terminated for security.",
          });
        }
        // Generate a new access token
        const newAccessToken = generateNewAccessToken(
          refreshTokenDecodedUser.userId
        );
        res.setHeader("Authorization", `Bearer ${newAccessToken}`);
        req.user = refreshTokenDecodedUser;

        return next();
      } catch (error) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ message: "Refresh token has expired" });
      }
    } else {
      // the user has access token but not refresh token
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Refresh token is required Please login again",
      });
    }
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
};

export default authenticateUser;

const validateRefreshToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const storedToken = await RefreshTokenModel.findOne({
      userId: decoded.userId,
      token: refreshToken,
    });
    if (!storedToken) {
      console.log(storedToken);
      await RefreshTokenModel.deleteMany({
        userId: refreshTokenDecodedUser.userId,
      });
      return false;
    }
    return decoded;
  } catch (error) {
    return null;
  }
};
