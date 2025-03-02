// @desc                    this class is responsbile for the generation of errors (predicted errors );

class ApiError extends Error {
  constructor(message, statusCode) {
    super();
    this.statusCode = statusCode;
    this.isOperational = true;
    this.message = message;
    this.status = 'fail';
  }
}

export default ApiError;
