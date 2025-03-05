/* eslint-disable unused-imports/no-unused-vars */
import {StatusCodes} from 'http-status-codes';
import mongoose from 'mongoose';
import ApiError from '../utils/api.error.js';
import process from 'process';
// Handle different types of Mongoose errors
const handleMongooseError = (err) => {
  // Mongoose Validation Error
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((el) => el.message);
    return new ApiError(
      `Validation failed: ${errors.join(', ')}`,
      StatusCodes.BAD_REQUEST
    );
  }

  // Mongoose CastError (Invalid ID)
  if (err instanceof mongoose.Error.CastError) {
    return new ApiError(
      `Invalid ${err.path}: ${err.value}`,
      StatusCodes.BAD_REQUEST
    );
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return new ApiError(
      `Duplicate ${field}. This ${field} already exists`,
      StatusCodes.CONFLICT
    );
  }

  return null;
};

// Handle JWT Errors
const handleJWTError = (err) => {
  if (err.name === 'JsonWebTokenError') {
    return new ApiError(
      'Invalid token. Please log in again',
      StatusCodes.UNAUTHORIZED
    );
  }

  if (err.name === 'TokenExpiredError') {
    return new ApiError(
      'Your token has expired. Please log in again',
      StatusCodes.UNAUTHORIZED
    );
  }

  return null;
};

const errorHandler = (err, req, res, next) => {
  let error = err;

  // If error is not an instance of ApiError, convert it
  if (!(error instanceof ApiError)) {
    // Handle Mongoose Errors
    const mongooseError = handleMongooseError(err);
    if (mongooseError) {
      error = mongooseError;
    }

    // Handle JWT Errors
    const jwtError = handleJWTError(err);
    if (jwtError) {
      error = jwtError;
    }

    // If error is still not an ApiError, create generic error
    if (!(error instanceof ApiError)) {
      error = new ApiError(
        'Something went wrong',
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  if (process.env.NODE_ENV === 'development') {
    sendErrForDev(error, res);
  } else {
    sendErrForProd(error, res);
  }
};

const sendErrForDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrForProd = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
};

export default errorHandler;
