import express from 'express';
import allowedFor from '../../../middlewares/allowed.for.js';
import authenticateUser from '../../../middlewares/authicate.user.js';
import validateRequest from '../../../middlewares/validate.request.js';
import RefreshTokenModel from '../../refresh_token/model/refresh_token.model.js';
import {
  getUserById,
  getUsers,
  login,
  logout,
  refreshToken,
  register,
  verifyEmail
} from '../controller/user.controller.js';
import UserModel from '../model/user.model.js';
import {
  createUserSchema,
  deleteUserSchema,
  getUserByIdSchema,
  getUsersSchema,
  loginSchema,
  verifyEmailSchema
} from '../validation/user.validation.js';
import upload from '../../../middlewares/file.upload.js';
import UploadFile from '../../../middlewares/file.upload.js';



const UserRoutes = express.Router();

UserRoutes.post(
  '/auth/register',
  UploadFile('avatar', 'users'),
  validateRequest(createUserSchema),
  (req, _, next) => {
    req.body.avatar = req.file.filename;
    next();
  },
  register
)
UserRoutes.post('/auth/login', validateRequest(loginSchema), login);

UserRoutes.post('/auth/refresh-token', refreshToken);
UserRoutes.post('/auth/logout', authenticateUser, logout);
// Protected routes
UserRoutes.get(
  '/verify-email/:token',
  validateRequest(verifyEmailSchema),
  verifyEmail
);
// Protected routes
UserRoutes.get(
  '/get',
  authenticateUser,
  validateRequest(getUsersSchema),
  getUsers
);

UserRoutes.get(
  '/:id',
  authenticateUser,
  validateRequest(getUserByIdSchema),
  getUserById
);

// UserRoutes.patch(
//   '/users/:id',
//   authenticateUser,
//   validateRequest(updateProfileSchema),
//   upload.single('avatar'),
//   updateProfile
// );

// // Admin routes
UserRoutes.delete(
  '/:id',
  authenticateUser,
  allowedFor('admin'),
  validateRequest(deleteUserSchema)
  // deleteUser
);

UserRoutes.delete(
  '/delete/all',
  // authenticateUser,
  // allowedFor('admin'),
  async (req, res) => {
    await UserModel.deleteMany({});
    await RefreshTokenModel.deleteMany({});
    res.status(200).json({ message: 'All users deleted successfully' });
  }
);

export default UserRoutes;
