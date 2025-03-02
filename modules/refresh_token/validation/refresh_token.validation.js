// validations/refreshToken.validation.js
import Joi from "joi";
import joiObjectId from "joi-objectid";

// Add objectId validation to Joi
const ObjectId = joiObjectId(Joi);

export const refreshTokenSchema = {
  body: Joi.object({
    refreshToken: Joi.string().required().messages({
      "string.empty": "Refresh token is required",
      "any.required": "Refresh token is required",
    }),
  }),
};

export const revokeTokenSchema = {
  params: Joi.object({
    tokenId: ObjectId().required().messages({
      "any.required": "Token ID is required",
      "string.pattern.name": "Invalid token ID format",
    }),
  }),
};

export const getUserSessionsSchema = {
  query: Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(50).default(10),
    sortBy: Joi.string()
      .valid("createdAt", "userAgent", "ip")
      .default("createdAt"),
    sortOrder: Joi.string().valid("asc", "desc").default("desc"),
  }),
};

export const validateUserIdSchema = {
  params: Joi.object({
    userId: ObjectId().required().messages({
      "any.required": "User ID is required",
      "string.pattern.name": "Invalid user ID format",
    }),
  }),
};
