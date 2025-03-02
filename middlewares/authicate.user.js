import jwt from "jsonwebtoken";
import RefreshToken from "../modules/refresh_token/model/refresh_token.model.js";
import { StatusCodes } from "http-status-codes";
// Generate a new access token
const generateNewAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
};

const authenticateUser = async (req, res, next) => {
  // Check for access token in Authorization header
  const authHeader = req.headers["authorization"];
  const accessToken = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN format

  // Check for refresh token in request body or cookies
  const refreshToken = req.cookies.refreshToken;

  // If neither token is provided
  if (!accessToken && !refreshToken) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Authentication token is required" });
  }

  // First try to validate the access token if it exists
  if (accessToken) {
    try {
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      req.user = decoded;
      // return next();
    } catch (error) {
      // If access token is expired and no refresh token, return expired error
      if (!refreshToken) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          message: "Unauthorized Access",
        });
      }
    }
  }

  // Validate refresh token if access token is not provided or is expired
  if (refreshToken) {
    try {
      // Verify the refresh token signature and expiration
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );

      // Check if token exists in database
      const storedToken = await RefreshToken.findOne({
        userId: decoded.userId,
        token: refreshToken,
      });

      if (!storedToken) {
        // Token not found in database - potential reuse detected
        await RefreshToken.deleteMany({ userId: decoded.userId });

        return res.status(StatusCodes.UNAUTHORIZED).json({
          message:
            "Refresh token reuse detected. All sessions have been terminated for security.",
        });
      }

      // Token is valid, attach user and token info to request
      req.user = decoded;

      // If this was an expired access token case, generate a new access token
      if (accessToken) {
        // Generate new access token
        const newAccessToken = generateNewAccessToken(decoded.userId);

        // Attach the new token to the response
        res.setHeader("X-New-Access-Token", newAccessToken);

        // Also include it in the response body for easier client access
        req.newAccessToken = newAccessToken;
      }

      return next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ message: "Refresh token has expired" });
      }
      return res.status(403).json({ message: "Invalid refresh token" });
    }
  }
};

export default authenticateUser;
