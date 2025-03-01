import { StatusCodes } from "http-status-codes";
import ApiError from "../api.error.js";
import ApiFeature from "../api.featuers.js";
import expressAsyncHandler from "express-async-handler";

const deleteHandler = (Model) =>
  expressAsyncHandler(async (req, res, next, error) => {
    const { id } = req.query;
    console.log("this is the id ");
    const deleted = await Model.findByIdAndDelete({ _id: id });
    console.log("this is the deleted object : ", deleted);
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
