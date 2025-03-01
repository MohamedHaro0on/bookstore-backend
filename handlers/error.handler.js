import { StatusCodes } from "http-status-codes";

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || StatusCodes.BAD_REQUEST;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    sendErrForDev(err, res);
  } else {
    sendErrForProd(err, res);
  }
};

const sendErrForDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrForProd = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
export default errorHandler;
