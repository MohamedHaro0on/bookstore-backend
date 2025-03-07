import expressAsyncHandler from "express-async-handler"
// import BookModel from "../modules/book/model/book.model.js";
import userModel from "../modules/user/model/user.model.js"
import ApiError from "../utils/api.error.js";
import { StatusCodes } from "http-status-codes";
// import mongoose from "mongoose";
const getUserCart = expressAsyncHandler(async (req, res, next) => {
    let { user } = req.body;

    // Fetch books from the database
    let userDetails = await userModel.findById(user).populate("cart.items");

    if (!userDetails) {
        return next(
            new ApiError(
                `user not found.`,
                StatusCodes.NOT_FOUND
            )
        );
    }
    let cart = userDetails.cart;
    console.log("this is the user's cart : ", cart);
    console.log("this is the user details : ", userDetails);
    if (cart.items.length === 0) {
        return next(
            new ApiError(
                `cart is empty can't make an order`,
                StatusCodes.NOT_FOUND
            )
        );
    }

    next();

})


export default getUserCart;