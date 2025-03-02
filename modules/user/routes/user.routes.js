import express from "express";
import authenticateUser from "../../../middlewares/authicate.user.js";
import validateRequest from "../../../middlewares/validate.request.js";
import {
  register,
  login,
  logout,
  refreshToken,
  getUsers,
  getUserById,
  // updateProfile,
  // deleteUser,
  // deleteAllUsers,
} from "../controller/user.controller.js";

import {
  createUserSchema,
  loginSchema,
  getUsersSchema,
  getUserByIdSchema,
  // updateProfileSchema,
  // deleteUserSchema,
} from "../validation/user.validation.js";

const UserRoutes = express.Router();

// Public routes
UserRoutes.post("/auth/register", validateRequest(createUserSchema), register);

UserRoutes.post("/auth/login", validateRequest(loginSchema), login);

UserRoutes.post("/auth/refresh-token", refreshToken);
UserRoutes.post("/auth/logout", authenticateUser, logout);

// Protected routes
UserRoutes.get(
  "/users",
  authenticateUser,
  validateRequest(getUsersSchema),
  getUsers
);

UserRoutes.get(
  "/users/:id",
  authenticateUser,
  validateRequest(getUserByIdSchema),
  getUserById
);

// UserRoutes.patch(
//   "/users/:id",
//   authenticateUser,
//   validateRequest(updateProfileSchema),
//   updateProfile
// );

// // Admin routes
// UserRoutes.delete(
//   "/users/:id",
//   authenticateUser,
//   // isAdmin,
//   validateRequest(deleteUserSchema),
//   deleteUser
// );

// UserRoutes.delete(
//   "/users",
//   authenticateUser, //isAdmin,
//   deleteAllUsers
// );

export default UserRoutes;
