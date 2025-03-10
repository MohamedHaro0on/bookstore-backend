import expressAsyncHandler from 'express-async-handler';
import {StatusCodes} from 'http-status-codes';
// import BookModel from "../modules/book/model/book.model.js";
import userModel from '../modules/user/model/user.model.js';
import ApiError from '../utils/api.error.js';
// import mongoose from "mongoose";
const getUserCart = expressAsyncHandler(async (req, res, next) => {
  const {user} = req.body;

  // Fetch books from the database
  const userDetails = await userModel.findById(user).populate('cart.items');

  if (!userDetails) {
    return next(
      new ApiError(
        `user not found.`,
        StatusCodes.NOT_FOUND
      )
    );
  }
  const cart = userDetails.cart;
  if (cart.items.length === 0) {
    return next(
      new ApiError(
        `cart is empty can't make an order`,
        StatusCodes.NOT_FOUND
      )
    );
  }

  next();
});

export default getUserCart;
