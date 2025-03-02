// routes/user.routes.js

import express from "express";
import validateRequest from "../../../middlewares/validate.request.js";
import authenticateUser from "../../../middlewares/authicate.user.js";
import {
  createUserSchema,
  loginSchema,
  getUsersSchema,
  getUserByIdSchema,
  updateProfileSchema,
  deleteUserSchema,
  //   changeRoleSchema,
} from "../validation/user.validation.js";
import {
  register,
  login,
  refreshToken,
  logout,
  getUserById,
} from "../controller/user.controller.js";

const UserRoutes = express.Router();

// Public routes
UserRoutes.post("/register", validateRequest(createUserSchema), register);
UserRoutes.post("/login", validateRequest(loginSchema), login);

// startring the protected routes :
// UserRoutes.get(
//   "/",
//   authenticateUser,
//   validateRequest(getUsersSchema),
//   getUsers
// );
UserRoutes.get(
  "/:id",
  authenticateUser,
  validateRequest(getUserByIdSchema),
  getUserById
);
// UserRoutes.patch(
//   "/:id",
//   authenticateUser,
//   validateRequest(updateProfileSchema),
//   updateProfile
// );

UserRoutes.post("/refresh-token", refreshToken);
UserRoutes.post("/logout", logout);
// Admin only routes
// UserRoutes.delete(
//   "/:id",
//   authenticateUser,
//   validateRequest(deleteUserSchema),
//   deleteUser
// );

export default UserRoutes;
