import {StatusCodes} from 'http-status-codes';
import ApiError from '../utils/api.error.js';

const routeNotImplementedHandler = (req, res, next) => {
  // create an error and send it to the error handler middler ware ;
  next(
    new ApiError(
      `Can't find this route : ${req.originalUrl}`,
      StatusCodes.BAD_REQUEST
    )
  );
};

export default routeNotImplementedHandler;
