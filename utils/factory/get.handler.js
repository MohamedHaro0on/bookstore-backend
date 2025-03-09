import expressAsyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../api.error.js';
import ApiFeatures from '../api.featuers.js';
import { redisClient } from '../../configurations/config.js';

const getHandler = (Model, object, withOwnerShip) =>
  expressAsyncHandler(async (req, res) => {
    if (withOwnerShip) {
      req.query.user = req.user.userId;
    }
    let apiFeatures = new ApiFeatures(Model.find(), req.query)
      .filter()
      .search()
      .sort()
      .paginate(await Model.estimatedDocumentCount());
    if (object) {
      apiFeatures = apiFeatures.populate(object);
    }

    const { mongooseQuery, paginationResult } = apiFeatures;
    const data = await mongooseQuery;
    if (data) {
      await redisClient.set(`${Model.modelName}:all`, JSON.stringify(data), {
        EX: 3600,
      });

      res.status(StatusCodes.OK).json({
        message: ` ${Model.modelName} Fetched Successfully`,
        ...paginationResult,
        data
      });
    } else {
      // if data is not found :
      return next(
        new ApiError(`${Model.modelName} is not found`, StatusCodes.NOT_FOUND)
      );
    }
  });

export default getHandler;
