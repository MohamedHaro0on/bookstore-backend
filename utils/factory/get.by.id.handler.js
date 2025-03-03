import expressAsyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import ApiError from "../api.error.js";
import ApiFeatures from "../api.featuers.js";

const GetByIdHandler = (Model, populateObject) =>
  expressAsyncHandler(async (req, res, next) => {
    let id = req.params.id ? req.params.id : req.query.id;

    let apiFeatures = null;
    apiFeatures = new ApiFeatures(Model.findById(id), req.query);
    if (populateObject) {
      apiFeatures = apiFeatures.populate(populateObject);
    }

    const { mongooseQuery } = apiFeatures;
    const data = await mongooseQuery;
    if (data) {
      res.status(StatusCodes.OK).json({
        message: ` ${Model.modelName} Fetched Successfully`,
        data,
      });
    } else {
      // if Product is not found :
      return next(
        new ApiError(`${Model.modelName} is not found`, StatusCodes.NOT_FOUND)
      );
    }
  });

export default GetByIdHandler;
