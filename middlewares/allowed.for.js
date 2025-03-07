import expressAsyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../utils/api.error.js';

const allowedFor = (...roles) => {
  return expressAsyncHandler(async (req, res, next) => {
    if (!req.user || !roles.includes(req.user)) {
      return next(
        new ApiError(`you are not authorized`, StatusCodes.UNAUTHORIZED)
      );
    }
    return next();
  });
};

export default allowedFor;
