import expressAsyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../api.error.js';

const updateHandler = (Model) =>
  expressAsyncHandler(async (req, res, next) => {
    const { id } = req.params;

    // Build query based on user role [Ownership]
    const query = { _id: id };
    if (req.user.role !== 'admin') {
      query.user = req.user.userId;
    }
    console.log("this is the query object : ", query);
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

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: `${Model.modelName} updated successfully`,
      data: updatedDocument
    });
  });

export default updateHandler;