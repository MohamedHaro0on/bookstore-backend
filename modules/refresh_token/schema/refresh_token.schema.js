import process from 'node:process';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const RefreshTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isValid: {
      type: Boolean,
      default: true
    },
    expiresAt: {
      type: Date,
      required: true
    }
  },
  {timestamps: true}
);

// Index for userId lookups
RefreshTokenSchema.index({userId: 1});

// TTL index for automatic document deletion
RefreshTokenSchema.index(
  {expiresAt: 1},
  {
    expireAfterSeconds: 0,
    name: 'tokenExpiryIndex' // Named index for easier management
  }
);

// Pre-save middleware to set expiresAt if not set
RefreshTokenSchema.pre('save', function (next) {
  if (!this.expiresAt) {
    const days = Number.parseInt(process.env.REFRESH_TOKEN_DAYS) || 90; // Default to 90 days if not set
    this.expiresAt = new Date(Date.now() + (days * 24 * 60 * 60 * 1000));
  }
  next();
});

// Static method to create a new refresh token
RefreshTokenSchema.statics.createToken = async function (userId) {
  const expiresAt = new Date();
  const days = Number.parseInt(process.env.REFRESH_TOKEN_DAYS) || 90;
  expiresAt.setDate(expiresAt.getDate() + days);

  const token = jwt.sign(
    {userId},
    process.env.REFRESH_TOKEN_SECRET,
    {expiresIn: `${days}d`}
  );

  return this.create({
    token,
    userId,
    expiresAt
  });
};

// Static method to invalidate all tokens for a user
RefreshTokenSchema.statics.invalidateAllUserTokens = async function (userId) {
  return this.updateMany(
    {userId},
    {isValid: false}
  );
};

export default RefreshTokenSchema;
