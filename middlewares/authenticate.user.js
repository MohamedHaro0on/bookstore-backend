import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import RefreshTokenModel from '../modules/refresh_token/model/refresh_token.model.js';
import process from 'process';
import ApiError from '../utils/api.error.js';

const generateNewAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY
  });
};

const validateRefreshToken = async (refreshToken) => {
  try {
    // First verify the JWT format and signature
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Find the token in database with additional checks
    const storedToken = await RefreshTokenModel.findOne({
      userId: decoded.userId,
      token: refreshToken,
      isValid: true,
      expiresAt: { $gt: new Date() }
    }).exec();

    if (!storedToken) {
      // Token reuse detected or invalid token
      await RefreshTokenModel.invalidateAllUserTokens(decoded.userId);
      return {
        isValid: false,
        reason: 'TOKEN_REUSE_DETECTED'
      };
    }

    // Check if token is close to expiry (optional)
    const timeUntilExpiry = storedToken.expiresAt.getTime() - Date.now();
    const isNearExpiry = timeUntilExpiry < (24 * 60 * 60 * 1000); // 24 hours

    return {
      isValid: true,
      decoded,
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
    path: '/' // Ensure cookie is cleared from all paths
  });
};

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    const refreshToken = req.cookies?.refreshToken;

    // Check if refresh token exists
    if (!refreshToken) {
      return next(new ApiError(
        "Authentication required. Please login.",
        StatusCodes.UNAUTHORIZED
      ));
    }

    // Validate refresh token
    const refreshTokenValidation = await validateRefreshToken(refreshToken);

    if (!refreshTokenValidation.isValid) {
      clearRefreshTokenCookie(res);

      switch (refreshTokenValidation.reason) {
        case 'TOKEN_REUSE_DETECTED':
          return next(new ApiError(
            "Security alert: Session compromised. Please login again.",
            StatusCodes.UNAUTHORIZED
          ));

        case 'TOKEN_EXPIRED':
          return next(new ApiError(
            "Session expired. Please login again.",
            StatusCodes.UNAUTHORIZED
          ));

        default:
          return next(new ApiError(
            "Invalid session. Please login again.",
            StatusCodes.UNAUTHORIZED
          ));
      }
    }

    const { decoded: refreshTokenDecoded, isNearExpiry } = refreshTokenValidation;

    // If access token exists, verify both tokens match
    if (accessToken) {
      try {
        const accessTokenDecoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

        // Verify that both tokens belong to the same user
        if (accessTokenDecoded.userId !== refreshTokenDecoded.userId) {
          await RefreshTokenModel.invalidateAllUserTokens(refreshTokenDecoded.userId);
          clearRefreshTokenCookie(res);

          return next(new ApiError(
            "Security alert: Token mismatch detected. Please login again.",
            StatusCodes.UNAUTHORIZED
          ));
        }

        // Set user info in request
        req.user = accessTokenDecoded;
        // req.body.user = accessTokenDecoded.userId;

        // If refresh token is near expiry, generate a new one (optional)
        if (isNearExpiry) {
          const newRefreshToken = await RefreshTokenModel.createToken(accessTokenDecoded.userId);
          res.cookie('refreshToken', newRefreshToken.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: parseInt(process.env.REFRESH_TOKEN_DAYS) * 24 * 60 * 60 * 1000
          });
        }

        return next();
      } catch (error) {
        // Access token is invalid/expired, generate new one
        const newAccessToken = generateNewAccessToken(refreshTokenDecoded.userId);
        res.setHeader('Authorization', `Bearer ${newAccessToken}`);

        req.user = refreshTokenDecoded;
        // req.body.user = refreshTokenDecoded.userId;
        return next();
      }
    } else {
      // Only refresh token exists (valid case)
      const newAccessToken = generateNewAccessToken(refreshTokenDecoded.userId);
      res.setHeader('Authorization', `Bearer ${newAccessToken}`);

      req.user = refreshTokenDecoded;
      // req.body.user = refreshTokenDecoded.userId;

      // If refresh token is near expiry, generate a new one (optional)
      if (isNearExpiry) {
        const newRefreshToken = await RefreshTokenModel.createToken(refreshTokenDecoded.userId);
        res.cookie('refreshToken', newRefreshToken.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: parseInt(process.env.REFRESH_TOKEN_DAYS) * 24 * 60 * 60 * 1000
        });
      }

      return next();
    }

  } catch (error) {
    console.error('Authentication error:', error);
    clearRefreshTokenCookie(res);
    return next(new ApiError(
      "Authentication failed. Please try again.",
      StatusCodes.INTERNAL_SERVER_ERROR
    ));
  }
};

export default authenticateUser;