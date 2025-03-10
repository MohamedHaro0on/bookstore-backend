import expressAsyncHandler from 'express-async-handler';
import {StatusCodes} from 'http-status-codes';
import {redisClient} from '../../configurations/config.js';
import ApiError from '../api.error.js';
import ApiFeatures from '../api.featuers.js';

const getByIdHandler = (Model, populateObject) =>
  expressAsyncHandler(async (req, res, next) => {
    const id = req.params.id ? req.params.id : req.query.id;

    let apiFeatures = null;
    apiFeatures = new ApiFeatures(Model.findById(id), req.query);
    if (populateObject) {
      apiFeatures = apiFeatures.populate(populateObject);
    }

    const {mongooseQuery} = apiFeatures;
    const data = await mongooseQuery;
    if (data) {
      await redisClient.set(`${Model.modelName}:${id}`, JSON.stringify(data), {
        EX: 3600
      });
      res.status(StatusCodes.OK).json({
        message: ` ${Model.modelName} Fetched Successfully`,
        data
      });
    } else {
      // if Product is not found :
      return next(
        new ApiError(`${Model.modelName} is not found`, StatusCodes.NOT_FOUND)
      );
    }
  });

export default getByIdHandler;
