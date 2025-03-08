import expressAsyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../utils/api.error.js';

const checkRole = (...roles) => expressAsyncHandler(async (req, res, next) => {
  if (req.user && roles.includes(req.user.role)) {
    return next();
  };
  return next(
    new ApiError(`you are not authorized mmeeeeee`, StatusCodes.UNAUTHORIZED)
  );
}
)

export default checkRole;
