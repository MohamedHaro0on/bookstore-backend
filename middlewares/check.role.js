import expressAsyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../utils/api.error.js';

const checkRole = (...roles) => {
  return expressAsyncHandler(async (req, _, next) => {
    console.log("this is the use role : ", req.user && roles.includes(req.user.role));
    if (req.user && roles.includes(req.user.role)) {
      return next();
    };
    return next(
      new ApiError(`you are not authorized`, StatusCodes.UNAUTHORIZED)
    );
  }
  )
};
export default checkRole;
