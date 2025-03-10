import expressAsyncHandler from 'express-async-handler';
import {StatusCodes} from 'http-status-codes';
import {redisClient} from '../../configurations/config.js';
import ApiError from '../api.error.js';

const deleteHandler = (Model) =>
  expressAsyncHandler(async (req, res) => {
    const {id} = req.params; // Changed from req.query to req.params for REST conventions

    // Build query based on user role [ OwnerShip ]
    const query = {_id: id};

    // Add user check if not admin
    if (req.user.role !== 'admin') {
      query.user = req.user.userId;
    }

    // Invalidate the cache for all documents
    await redisClient.del(`${Model.modelName}:all`);

    // Invalidate the cache for the deleted document
    const deleted = await Model.findOneAndDelete(query);

    if (!deleted) {
      throw new ApiError(
        req.user.role === 'admin'
          ? `${Model.modelName} not found`
          : `${Model.modelName} not found or you're not authorized`,
        StatusCodes.NOT_FOUND
      );
    }

    await redisClient.del(`${Model.modelName}:${id}`);

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: `${Model.modelName} successfully deleted`,
      data: deleted
    });
  });

export default deleteHandler;
