import expressAsyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../api.error.js';
import { redisClient } from '../../configurations/config.js';

const createHandler = (Model) =>
  expressAsyncHandler(async (req, res, next, error) => {
    if (req.user) {
      req.body.user = req.user.userId;
    };
    const createdDocument = await Model.create(req.body);

    if (createdDocument) {

      // Invalidate the cache for all documents
      await redisClient.del(`${Model.modelName}:all`);
      
      // Cache the newly created document
      await redisClient.set(`${Model.modelName}:${id}`, JSON.stringify(data), {
        EX: 3600,
      });

      return res.status(StatusCodes.OK).json({
        message: `${Model.modelName} Created Succefully successfully`,
        data: createdDocument
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
