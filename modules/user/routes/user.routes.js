import express from 'express';
import allowedFor from '../../../middlewares/check.role.js';
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
  verifyEmail,
  attachAvatar
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
import UploadFile from '../../../middlewares/file.upload.js';
import checkRole from '../../../middlewares/check.role.js';

const userRouter = express.Router();

// Middleware object
const validate = {
  create: validateRequest(createUserSchema),
  login: validateRequest(loginSchema),
  verifyEmail: validateRequest(verifyEmailSchema),
  getUsers: validateRequest(getUsersSchema),
  getById: validateRequest(getUserByIdSchema),
  delete: validateRequest(deleteUserSchema)
};

// File upload middleware
const upload = {
  avatar: UploadFile('avatar', 'users')
};

// Auth routes
userRouter
  .route('/auth/register')
  .post(upload.avatar, attachAvatar, validate.create, register);

userRouter
  .route('/auth/login')
  .post(validate.login, login);

userRouter
  .route('/auth/refresh-token')
  .post(refreshToken);

userRouter
  .route('/auth/logout')
  .post(authenticateUser, logout);

// Email verification
userRouter
  .route('/verify-email/:token')
  .get(validate.verifyEmail, verifyEmail);

// Protected user routes
userRouter
  .route('/get')
  .get(authenticateUser, validate.getUsers, getUsers);

userRouter
  .route('/:id')
  .get(authenticateUser, validate.getById, getUserById)
  .delete(authenticateUser, allowedFor('admin'), validate.delete);

// Admin routes
const adminRouter = express.Router();

adminRouter
  .route('/delete/all')
  .delete(
    authenticateUser,
    checkRole('admin'),
    async (req, res) => {
      await UserModel.deleteMany({});
      await RefreshTokenModel.deleteMany({});
      res.status(200).json({ message: 'All users deleted successfully' });
    }
  );

// Attach admin routes
userRouter.use('/admin', adminRouter);

export default userRouter;