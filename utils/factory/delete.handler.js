import expressAsyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import ApiError from "../api.error.js";

const deleteHandler = (Model) =>
  expressAsyncHandler(async (req, res, next, error) => {
    const { id } = req.query;
    const deleted = await Model.findByIdAndDelete({ _id: id });
    if (deleted) {
      res.status(StatusCodes.OK).json({
        message: `${Model.modelName} Found and was Deleted`,
        data: deleted,
      });
    } else {
      // handles if the Brand id is not found ;
      return next(
        new ApiError(`${Model.modelName} is not found`, StatusCodes.NOT_FOUND)
      );
    }
  });

export default deleteHandler;
