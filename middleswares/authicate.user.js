// middleware/authenticate_user.js

import jwt from "jsonwebtoken";
import expressAsyncHandler from "express-async-handler";
import { User } from "../modules/user/models/user.model.js";
import { RefreshToken } from "../modules/refresh_token/models/refresh_token.model.js";
import { ApiError } from "../utils/ApiError.js";

export const verifyJWT = expressAsyncHandler(async (req, res, next) => {
  // Get tokens from cookies or authorization header
  const accessToken =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  const refreshToken =
    req.cookies?.refreshToken || req.header("x-refresh-token");

  if (!accessToken) {
    throw new ApiError(401, "Unauthorized - No access token provided");
  }

  try {
    // Verify access token
    const decodedAccessToken = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    const user = await User.findById(decodedAccessToken?._id).select(
      "-password"
    );

    if (!user) {
      throw new ApiError(401, "Unauthorized - Invalid access token");
    }

    req.user = user;
    next();
  } catch (error) {
    // If access token is expired and refresh token exists, try to refresh
    if (error.name === "TokenExpiredError" && refreshToken) {
      try {
        // Verify refresh token
        const decodedRefreshToken = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET
        );

        // Check if refresh token exists and is valid in database
        const existingToken = await RefreshToken.findOne({
          token: refreshToken,
          userId: decodedRefreshToken._id,
          isValid: true,
        });

        if (!existingToken) {
          throw new ApiError(401, "Unauthorized - Invalid refresh token");
        }

        // Check if refresh token is expired in database
        if (existingToken.expiresAt < new Date()) {
          throw new ApiError(401, "Unauthorized - Refresh token expired");
        }

        // Get user
        const user = await User.findById(decodedRefreshToken._id).select(
          "-password"
        );

        if (!user) {
          throw new ApiError(401, "Unauthorized - User not found");
        }

        // Generate new tokens
        const newAccessToken = jwt.sign(
          { _id: user._id },
          process.env.ACCESS_TOKEN_SECRET,
          {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
          }
        );

        const newRefreshToken = jwt.sign(
          { _id: user._id },
          process.env.REFRESH_TOKEN_SECRET,
          {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
          }
        );

        // Invalidate old refresh token
        existingToken.isValid = false;
        await existingToken.save();

        // Create new refresh token record
        const expiresAt = new Date();
        expiresAt.setDate(
          expiresAt.getDate() + parseInt(process.env.REFRESH_TOKEN_DAYS)
        );

        await RefreshToken.create({
          token: newRefreshToken,
          userId: user._id,
          expiresAt,
          userAgent: req.headers["user-agent"],
          ip: req.ip,
        });

        // Set new cookies
        const options = {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        };

        res
          .cookie("accessToken", newAccessToken, options)
          .cookie("refreshToken", newRefreshToken, options);

        req.user = user;
        next();
      } catch (refreshError) {
        throw new ApiError(
          401,
          "Unauthorized - Error refreshing token",
          refreshError?.message
        );
      }
    } else {
      throw new ApiError(
        401,
        "Unauthorized - Invalid access token",
        error?.message
      );
    }
  }
});

export const isAuthenticated = expressAsyncHandler(async (req, res, next) => {
  const accessToken =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!accessToken) {
    return next();
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded._id).select("-password");
    req.user = user;
  } catch (error) {
    // Ignore token verification errors
  }

  next();
});

export const requireAuth = expressAsyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized - Authentication required");
  }
  next();
});

export const validateTokens = expressAsyncHandler(async (req, res, next) => {
  const accessToken =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  const refreshToken =
    req.cookies?.refreshToken || req.header("x-refresh-token");

  if (!accessToken && !refreshToken) {
    return res.json({
      isValid: false,
      message: "No tokens provided",
    });
  }

  try {
    let tokenStatus = {
      accessToken: false,
      refreshToken: false,
    };

    if (accessToken) {
      try {
        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        tokenStatus.accessToken = true;
      } catch (error) {
        tokenStatus.accessToken = false;
      }
    }

    if (refreshToken) {
      try {
        const decoded = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET
        );
        const existingToken = await RefreshToken.findOne({
          token: refreshToken,
          userId: decoded._id,
          isValid: true,
        });

        tokenStatus.refreshToken = existingToken ? true : false;
      } catch (error) {
        tokenStatus.refreshToken = false;
      }
    }

    res.json({
      isValid: tokenStatus.accessToken || tokenStatus.refreshToken,
      tokens: tokenStatus,
    });
  } catch (error) {
    next(error);
  }
});
