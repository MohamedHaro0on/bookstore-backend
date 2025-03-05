import express from 'express';
import allowedFor from '../../../middlewares/allowed.for.js';
import authenticateUser from '../../../middlewares/authicate.user.js';
import sendEmail from '../../../middlewares/email/send.email.js';

import validateRequest from '../../../middlewares/validate.request.js';
import RefreshTokenModel from '../../refresh_token/model/refresh_token.model.js';
import {
  getUserById,
  getUsers,
  login,
  logout,
  refreshToken,
  register
} from '../controller/user.controller.js';
import UserModel from '../model/user.model.js';
import {
  createUserSchema,
  deleteUserSchema,
  getUserByIdSchema,
  getUsersSchema,
  loginSchema
} from '../validation/user.validation.js';

const UserRoutes = express.Router();

// Public routes
UserRoutes.post(
  '/auth/register',
  validateRequest(createUserSchema),
  sendEmail,
  register
);

UserRoutes.post('/auth/login', validateRequest(loginSchema), login);

UserRoutes.post('/auth/refresh-token', refreshToken);
UserRoutes.post('/auth/logout', authenticateUser, logout);

// Protected routes
UserRoutes.get(
  '/users',
  authenticateUser,
  validateRequest(getUsersSchema),
  getUsers
);

UserRoutes.get(
  '/users/:id',
  authenticateUser,
  validateRequest(getUserByIdSchema),
  getUserById
);

// UserRoutes.patch(
//   '/users/:id',
//   authenticateUser,
//   validateRequest(updateProfileSchema),
//   updateProfile
// );

// // Admin routes
UserRoutes.delete(
  '/users/:id',
  authenticateUser,
  allowedFor('admin'),
  validateRequest(deleteUserSchema)
  // deleteUser
);

UserRoutes.delete(
  '/users',
  authenticateUser,
  allowedFor('admin'),
  async (req, res) => {
    await UserModel.deleteMany({});
    await RefreshTokenModel.deleteMany({});
    res.status(200).json({message: 'All users deleted successfully'});
  }
);

export default UserRoutes;
