// routes/user.routes.js

import express from "express";
import { validateRequest } from "../middleware/validate.request.js";
import { authenticate } from "../middleware/auth.user.js";
import {
  createUserSchema,
  loginSchema,
  getUsersSchema,
  getUserByIdSchema,
  updateProfileSchema,
  deleteUserSchema,
  //   changeRoleSchema,
} from "../validations/user.validation.js";

const UserRoutes = express.Router();

// Public routes
UserRoutes.post("/register", validateRequest(createUserSchema), createUser);
UserRoutes.post("/login", validateRequest(loginSchema), login);

// UserRoutes.use(authenticate);

// startring the protected routes :
UserRoutes.get("/", validateRequest(getUsersSchema), getUsers);
UserRoutes.get("/:id", validateRequest(getUserByIdSchema), getUserById);
UserRoutes.patch("/:id", validateRequest(updateProfileSchema), updateProfile);

// Admin only routes
UserRoutes.delete(
  "/:id",
  validateRequest(deleteUserSchema),
  //isAdmin,
  deleteUser
);
// UserRoutes.patch(
//   "/:id/role",
//   validateRequest(changeRoleSchema),
//   isAdmin,
//   changeRole
// );

export default router;
