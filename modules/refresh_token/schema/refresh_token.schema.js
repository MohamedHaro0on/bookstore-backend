// models/refreshToken.model.js
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

// Indexes
RefreshTokenSchema.index({userId: 1});
RefreshTokenSchema.index({expiresAt: 1}, {expireAfterSeconds: 0});
export default RefreshTokenSchema;
