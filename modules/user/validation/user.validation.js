import Joi from "joi";
import joiObjectId from "joi-objectid";

// Add objectId validation to Joi
const ObjectId = joiObjectId(Joi);

export const createUserSchema = {
  body: Joi.object({
    firstName: Joi.string().required().trim().messages({
      "string.empty": "First name is required",
      "any.required": "First name is required",
    }),
    lastName: Joi.string().required().trim().messages({
      "string.empty": "Last name is required",
      "any.required": "Last name is required",
    }),
    email: Joi.string().email().required().trim().messages({
      "string.email": "Please provide a valid email",
      "string.empty": "Email is required",
      "any.required": "Email is required",
    }),
    password: Joi.string().min(6).required().messages({
      "string.min": "Password must be at least 6 characters long",
      "string.empty": "Password is required",
      "any.required": "Password is required",
    }),
    username: Joi.string().trim(),
    phoneNumber: Joi.string().trim(),
    avatar: Joi.string().uri().messages({
      "string.uri": "Avatar must be a valid URL",
    }),
  }),
};

export const loginSchema = {
  body: Joi.object({
    email: Joi.string().email().required().trim().messages({
      "string.email": "Please provide a valid email",
      "string.empty": "Email is required",
      "any.required": "Email is required",
    }),
    password: Joi.string().required().messages({
      "string.empty": "Password is required",
      "any.required": "Password is required",
    }),
  }),
};

export const getUsersSchema = {
  query: Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    role: Joi.string().valid("user", "admin"),
    isVerified: Joi.boolean(),
    search: Joi.string().trim(),
    sortBy: Joi.string().valid("createdAt", "firstName", "email"),
    id: ObjectId().messages({
      "any.required": "User ID is required",
      "string.pattern.name": "Invalid user ID format",
    }),
  }),
};

export const getUserByIdSchema = {
  query: Joi.object({
    id: ObjectId().required().messages({
      "any.required": "User ID is required",
      "string.pattern.name": "Invalid user ID format",
    }),
  }),
};

export const updateProfileSchema = {
  params: Joi.object({
    id: ObjectId().required().messages({
      "any.required": "User ID is required",
      "string.pattern.name": "Invalid user ID format",
    }),
  }),
  body: Joi.object({
    firstName: Joi.string().trim(),
    lastName: Joi.string().trim(),
    username: Joi.string().trim(),
    phoneNumber: Joi.string().trim(),
    avatar: Joi.string().uri().messages({
      "string.uri": "Avatar must be a valid URL",
    }),
  })
    .min(1)
    .messages({
      "object.min": "At least one field must be provided for update",
    }),
};

export const deleteUserSchema = {
  params: Joi.object({
    id: ObjectId().required().messages({
      "any.required": "User ID is required",
      "string.pattern.name": "Invalid user ID format",
    }),
  }),
};

export const changeRoleSchema = {
  params: Joi.object({
    id: ObjectId().required().messages({
      "any.required": "User ID is required",
      "string.pattern.name": "Invalid user ID format",
    }),
  }),
  body: Joi.object({
    role: Joi.string().valid("user", "admin").required().messages({
      "any.only": "Role must be either 'user' or 'admin'",
      "any.required": "Role is required",
    }),
  }),
};
