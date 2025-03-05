import jwt from 'jsonwebtoken';
import RefreshTokenModel from '../modules/refresh_token/model/refresh_token.model.js';
import process from 'process';
// Generate tokens
const generateTokens = async (userId, role) => {
  const payload = {userId, role};
  const expiryDate = new Date();

  // Get the refresh token expiry from .env (assuming it's in days)
  const refreshTokenDays = Number.parseInt(process.env.REFRESH_TOKEN_DAYS);
  expiryDate.setDate(expiryDate.getDate() + refreshTokenDays);

  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY
  });

  const refreshToken = jwt.sign(
    {...payload},
    process.env.REFRESH_TOKEN_SECRET,
    {expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
  );

  await RefreshTokenModel.findOneAndDelete({userId});
  await RefreshTokenModel.create({
    userId,
    token: refreshToken,
    expiresAt: expiryDate,
    isValid: true
  });

  return {
    accessToken,
    refreshToken,
    expiryDate
  };
};

export default generateTokens;
