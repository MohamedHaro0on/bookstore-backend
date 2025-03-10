import expressAsyncHandler from 'express-async-handler';
import {StatusCodes} from 'http-status-codes';
import {redisClient} from '../../configurations/config.js';
import ApiError from '../api.error.js';

const createHandler = (Model) =>
  expressAsyncHandler(async (req, res, next) => {
    if (req.user) {
      req.body.user = req.user.userId;
    }
    const createdDocument = await Model.create(req.body);

    if (createdDocument) {
      // Invalidate the cache for all documents
      await redisClient.del(`${Model.modelName}:all`);

      // Cache the newly created document
      await redisClient.set(`${Model.modelName}:${createdDocument.id}`, JSON.stringify(createdDocument), {
        EX: 3600
      });

      return res.status(StatusCodes.CREATED).json({
        message: `${Model.modelName} Created Succefully`,
        data: createdDocument
      });
    }

    return next(
      new ApiError(
        `${Model.modelName} could not be created.`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  });

export default createHandler;
