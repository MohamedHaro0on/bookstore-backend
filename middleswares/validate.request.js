import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/api.error.js";
import errorHandler from "../handlers/error.handler.js";

const validateRequest = (schema) => {
  return async (req, res, next) => {
    const validationOptions = { abortEarly: false }; // Validate all fields, not just the first error
    try {
      // Validate body, params, and query if they exist in the schema
      if (schema.body) {
        await schema.body.validateAsync(req.body, validationOptions);
      }
      if (schema.params) {
        await schema.params.validateAsync(req.params, validationOptions);
      }
      if (schema.query) {
        await schema.query.validateAsync(req.query, validationOptions);
      }

      // If validation passes, proceed to the next middleware or controller
      next();
    } catch (error) {
      let customError = null;
      if (error.details) {
        console.log("this is inside the error.details 1", error);
        customError = new ApiError(
          error.details.map((detail) => detail.message).join(", "),
          StatusCodes.BAD_REQUEST
        );
        errorHandler(customError, req, res, next);
      } else {
        // Handle custom errors (e.g., from CheckSubCategoriesExistInTheSameCategory)
        customError = new ApiError(error?.message, StatusCodes.BAD_REQUEST);
        errorHandler(customError, req, res, next);
      }
    }
  };
};

export default validateRequest;
