import expressAsyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import ApiError from "../api.error.js";

const createHandler = (Model) =>
  expressAsyncHandler(async (req, res, next, error) => {
    console.log("Model : ", req.body);
    const createdDocument = await Model.create(req.body);

    if (createdDocument) {
      return res.status(StatusCodes.OK).json({
        message: `${Model.modelName} Created Succefully successfully`,
        data: createdDocument,
      });
    }

    // If no ${Model.modelName} was found to update
    return next(
      new ApiError(
        `${Model.modelName} not found or could not be updated.`,
        StatusCodes.NOT_FOUND
      )
    );
  });

export default createHandler;
