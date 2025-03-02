// controllers/refreshToken.controller.js

import expressAsyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { RefreshToken } from "../models/refreshToken.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { StatusCodes } from "http-status-codes";

const generateTokens = async (userId, req) => {
  try {
    const accessToken = jwt.sign(
      { _id: userId },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
      }
    );

    const refreshToken = jwt.sign(
      { _id: userId },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
      }
    );

    const expiresAt = new Date();
    expiresAt.setDate(
      expiresAt.getDate() + parseInt(process.env.REFRESH_TOKEN_DAYS)
    );

    await RefreshToken.create({
      token: refreshToken,
      userId,
      expiresAt,
      userAgent: req.headers["user-agent"],
      ip: req.ip,
    });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Error generating tokens",
      error?.message || "Something went wrong"
    );
  }
};

export const refreshAccessToken = expressAsyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

  const tokenDoc = await RefreshToken.findOne({
    token: refreshToken,
    userId: decoded._id,
    isValid: true,
  });

  if (!tokenDoc) {
    throw new ApiError(401, "Invalid refresh token");
  }

  if (tokenDoc.expiresAt < new Date()) {
    throw new ApiError(401, "Refresh token expired");
  }

  tokenDoc.isValid = false;
  await tokenDoc.save();

  const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
    await generateTokens(decoded._id, req);

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(StatusCodes.ACCEPTED)
    .cookie("accessToken", newAccessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
      new ApiResponse(
        StatusCodes.ACCEPTED,
        { accessToken: newAccessToken, refreshToken: newRefreshToken },
        "Tokens refreshed successfully"
      )
    );
});

export const getUserSessions = expressAsyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { [sortBy]: sortOrder === "desc" ? -1 : 1 },
    select: "-token",
  };

  const sessions = await RefreshToken.paginate(
    { userId: req.user._id, isValid: true },
    options
  );

  res.json(
    new ApiResponse(
      StatusCodes.ACCEPTED,
      sessions,
      "Sessions retrieved successfully"
    )
  );
});

export const getUserSessionsByAdmin = expressAsyncHandler(async (req, res) => {
  const { userId } = req.params;
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { [sortBy]: sortOrder === "desc" ? -1 : 1 },
    select: "-token",
  };

  const sessions = await RefreshToken.paginate(
    { userId, isValid: true },
    options
  );

  res.json(
    new ApiResponse(
      StatusCodes.ACCEPTED,
      sessions,
      "User sessions retrieved successfully"
    )
  );
});

export const revokeSession = expressAsyncHandler(async (req, res) => {
  const { tokenId } = req.params;

  const session = await RefreshToken.findOne({
    _id: tokenId,
    userId: req.user._id,
  });

  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  session.isValid = false;
  await session.save();

  res.json(
    new ApiResponse(StatusCodes.ACCEPTED, null, "Session revoked successfully")
  );
});

export const revokeAllSessions = expressAsyncHandler(async (req, res) => {
  await RefreshToken.updateMany(
    { userId: req.user._id, isValid: true },
    { isValid: false }
  );

  res.json(
    new ApiResponse(
      StatusCodes.ACCEPTED,
      null,
      "All sessions revoked successfully"
    )
  );
});

export const revokeAllSessionsByAdmin = expressAsyncHandler(
  async (req, res) => {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    await RefreshToken.updateMany(
      { userId, isValid: true },
      { isValid: false }
    );

    res.json(
      new ApiResponse(
        StatusCodes.ACCEPTED,
        null,
        "All user sessions revoked successfully"
      )
    );
  }
);
