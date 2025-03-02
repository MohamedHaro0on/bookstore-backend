import jwt from "jsonwebtoken";
import RefreshToken from "../modules/refresh_token/model/refresh_token.model.js";
import { StatusCodes } from "http-status-codes";
import generateTokens from "../utils/generate.tokens.js";

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

    // If no tokens are provided, deny access
    if (!accessToken && !refreshToken) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Authentication token is required" });
    }

    let accessTokenDecodedUser = null;
    let refreshTokenDecodedUser = null;

    // Verify access token if available
    if (accessToken) {
      try {
        accessTokenDecodedUser = jwt.verify(
          accessToken,
          process.env.ACCESS_TOKEN_SECRET
        );

        const tokens = await generateTokens(
          accessTokenDecodedUser.userId,
          accessTokenDecodedUser.role
        );
        res.setHeader("Authorization", `Bearer ${tokens.accessToken}`);
        // Set refresh token as HTTP-only cookie
        res.cookie("refreshToken", tokens.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "Strict",
          expires: tokens.expiryDate,
        });
        req.user = accessTokenDecodedUser;
        return next(); // If access token is valid, proceed to next middleware
      } catch (error) {
        if (!(error instanceof jwt.TokenExpiredError)) {
          console.log(error);
          return res
            .status(StatusCodes.FORBIDDEN)
            .json({ message: "Invalid access token" });
        }
      }
    }

    // Proceed with refresh token validation
    if (refreshToken) {
      try {
        // Verify refresh token
        refreshTokenDecodedUser = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET
        );

        // Check if refresh token exists in the database
        const storedToken = await RefreshToken.findOne({
          userId: refreshTokenDecodedUser.userId,
          token: refreshToken,
        });

        if (!storedToken) {
          await RefreshToken.deleteMany({
            userId: refreshTokenDecodedUser.userId,
          });
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
        if (error instanceof jwt.TokenExpiredError) {
          return res
            .status(StatusCodes.UNAUTHORIZED)
            .json({ message: "Refresh token has expired" });
        }
        return res
          .status(StatusCodes.FORBIDDEN)
          .json({ message: "Invalid refresh token" });
      }
    }
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
};

export default authenticateUser;
