import { StatusCodes } from "http-status-codes";
import ApiError from "../api.error.js";
import ApiFeatures from "../api.featuers.js";
import expressAsyncHandler from "express-async-handler";
import mongoose from "mongoose";

const GetByIdHandler = (Model, populateObject) =>
  expressAsyncHandler(async (req, res, next) => {
    const { id } = req.query;
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
      //if Product is not found :
      return next(
        new ApiError(`${Model.modelName} is not found`, StatusCodes.NOT_FOUND)
      );
    }
  });

export default GetByIdHandler;

export const getSubCategoriesForCategory = (Model) =>
  expressAsyncHandler(async (req, res) => {
    const { id } = req.query;
    let apiFeatures = new ApiFeatures(Model, req.query);
    apiFeatures = apiFeatures.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(id) }, // Use 'new' keyword
      },
      {
        $lookup: {
          from: "subcategories", // Collection name for SubCategoryModel
          localField: "_id",
          foreignField: "mainCategoryId",
          as: "subCategories",
        },
      },
      {
        $project: {
          name: 1, // Include the category name
          subCategories: 1, // Include the populated sub-categories
        },
      },
    ]);

    const { mongooseQuery } = apiFeatures;
    const data = await mongooseQuery;
    if (data) {
      res.status(StatusCodes.OK).json({
        message: ` ${Model.modelName} Fetched Successfully`,
        data,
      });
    } else {
      //if Product is not found :
      return next(
        new ApiError(`${Model.modelName} is not found`, StatusCodes.NOT_FOUND)
      );
    }
  });
