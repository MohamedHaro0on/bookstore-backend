import expressAsyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import RefreshTokenModel from '../modules/refresh_token/model/refresh_token.model.js';
import ApiError from '../utils/api.error.js';

const generateNewAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user.userId,
      role: user.role
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  );
};

const validateRefreshToken = async (refreshToken) => {
  try {
    // Verify token format and signature
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Find and validate token in database
    const storedToken = await RefreshTokenModel.findOne({
      userId: decoded.userId,
      token: refreshToken,
      isValid: true,
      expiresAt: { $gt: new Date() }
    }); // Populate user to get role

    if (!storedToken) {
      // Invalidate all tokens if token reuse is detected
      await RefreshTokenModel.invalidateAllUserTokens(decoded.userId);
      return {
        isValid: false,
        reason: 'TOKEN_REUSE_DETECTED'
      };
    }

    // Check if token is near expiry (24 hours)
    const timeUntilExpiry = storedToken.expiresAt.getTime() - Date.now();
    const isNearExpiry = timeUntilExpiry < (24 * 60 * 60 * 1000);

    return {
      isValid: true,
      decoded: {
        userId: decoded.userId,
        role: storedToken.userId.role
      },
      token: storedToken,
      isNearExpiry
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return {
        isValid: false,
        reason: 'TOKEN_EXPIRED'
      };
    }
    return {
      isValid: false,
      reason: 'TOKEN_INVALID'
    };
  }
};

const clearRefreshTokenCookie = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });
};

const setTokens = async (res, user, newRefreshToken = null) => {
  // Generate new access token
  const accessToken = generateNewAccessToken(user);
  res.setHeader('Authorization', `Bearer ${accessToken}`);

  // Set refresh token if provided
  if (newRefreshToken) {
    res.cookie('refreshToken', newRefreshToken.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: parseInt(process.env.REFRESH_TOKEN_DAYS) * 24 * 60 * 60 * 1000
    });
  }
};

const authenticateUser = expressAsyncHandler(async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    const refreshToken = req.cookies?.refreshToken;

    // Require refresh token
    if (!refreshToken) {
      throw new ApiError("Authentication required. Please login.", StatusCodes.UNAUTHORIZED);
    }

    // Validate refresh token
    const refreshTokenValidation = await validateRefreshToken(refreshToken);

    if (!refreshTokenValidation.isValid) {
      clearRefreshTokenCookie(res);

      switch (refreshTokenValidation.reason) {
        case 'TOKEN_REUSE_DETECTED':
          throw new ApiError(
            "Security alert: Session compromised. Please login again.",
            StatusCodes.UNAUTHORIZED
          );
        case 'TOKEN_EXPIRED':
          throw new ApiError(
            "Session expired. Please login again.",
            StatusCodes.UNAUTHORIZED
          );
        default:
          throw new ApiError(
            "Invalid session. Please login again.",
            StatusCodes.UNAUTHORIZED
          );
      }
    }

    const { decoded: refreshTokenDecoded, isNearExpiry } = refreshTokenValidation;

    // Handle access token if present
    if (accessToken) {
      try {
        const accessTokenDecoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

        // Verify token user match
        if (accessTokenDecoded.userId !== refreshTokenDecoded.userId) {
          await RefreshTokenModel.invalidateAllUserTokens(refreshTokenDecoded.userId);
          clearRefreshTokenCookie(res);
          throw new ApiError(
            "Security alert: Token mismatch detected. Please login again.",
            StatusCodes.UNAUTHORIZED
          );
        }

        // Set user info from valid access token
        req.user = {
          userId: accessTokenDecoded.userId,
          role: accessTokenDecoded.role
        };
      } catch (error) {
        // Access token invalid/expired - use refresh token data
        req.user = refreshTokenDecoded;
        await setTokens(res, refreshTokenDecoded);
      }
    } else {
      // No access token - set user from refresh token
      req.user = refreshTokenDecoded;
      await setTokens(res, refreshTokenDecoded);
    }

    // Handle refresh token rotation if near expiry
    if (isNearExpiry) {
      const newRefreshToken = await RefreshTokenModel.createToken(req.user.userId);
      await setTokens(res, req.user, newRefreshToken);
    }

    // Verify user object is properly set
    if (!req.user?.role) {
      throw new ApiError(
        "Authentication failed: Invalid user data",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }

    // Log for debugging
    console.log('Authenticated user:', {
      userId: req.user.userId,
      role: req.user.role
    });

    next();
  } catch (error) {
    clearRefreshTokenCookie(res);
    throw error instanceof ApiError ? error : new ApiError(
      "Authentication failed. Please try again.",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
});

export default authenticateUser;