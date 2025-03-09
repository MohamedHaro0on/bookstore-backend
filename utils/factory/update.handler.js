import expressAsyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../api.error.js';
import { redisClient } from '../../configurations/config.js';

const updateHandler = (Model) =>
  expressAsyncHandler(async (req, res, next) => {
    const { id } = req.params;

    // Build query based on user role [Ownership]
    const query = { _id: id };
    if (req.user.role !== 'admin') {
      query.user = req.user.userId;
    }
    const updatedDocument = await Model.findOneAndUpdate(
      query,
      req.body,
      {
        new: true,      // Return the updated document
        runValidators: true // Run schema validators
      }
    );

    if (!updatedDocument) {
      throw new ApiError(
        req.user.role === 'admin'
          ? `${Model.modelName} not found`
          : `${Model.modelName} not found or you're not authorized`,
        StatusCodes.NOT_FOUND
      );
    }

    // Invalidate the cache for all documents
    await redisClient.del(`${Model.modelName}:all`);
    
    // Invalidate the updated document
    await redisClient.del(`${Model.modelName}:${id}`);
      
    // Cache the updated document
    await redisClient.set(`${Model.modelName}:${id}`, JSON.stringify(data), {
      EX: 3600,
    });

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: `${Model.modelName} updated successfully`,
      data: updatedDocument
    });
  });

export default updateHandler;