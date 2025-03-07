import expressAsyncHandler from 'express-async-handler';
import createHandler from '../../../utils/factory/create.handler.js';

import deleteHandler from '../../../utils/factory/delete.handler.js';
import GetByIdHandler from '../../../utils/factory/get.by.id.handler.js';
import GetHandler from '../../../utils/factory/get.handler.js';
import updateHandler from '../../../utils/factory/update.handler.js';
import CartModel from '../model/cart.model.js';
import ApiError from '../../../utils/api.error.js';
import { StatusCodes } from 'http-status-codes';

export const createCart = createHandler(CartModel);

export const getAllCarts = GetHandler(CartModel);

export const getCartById = GetByIdHandler(CartModel);

export const updateCart = updateHandler(CartModel);

export const deleteCart = deleteHandler(CartModel);


export const addItems = expressAsyncHandler(async (req, res, next) => {

    const { user, items } = req.body;

    const userCart = await CartModel.findOne({ user, status: "active" })
    if (!userCart) {
        return next(new ApiError("user's cart is not found ", StatusCodes.BAD_REQUEST))
    }

    userCart.items.push(...items);
    // Save the updated cart
    const updatedCart = await userCart.save();

    res.status(StatusCodes.OK).json({
        status: 'success',
        data: updatedCart
    });

})



export const removeItems = expressAsyncHandler(async (req, res, next) => {

    const { user, items } = req.body;
    console.log("this is the user : ", user)
    const userCart = await CartModel.findOne({ user, status: "active" })
    if (!userCart) {
        return next(new ApiError("user's cart is not found ", StatusCodes.BAD_REQUEST))
    }

    userCart.items = userCart.items.filter(item => {
        items.includes(object => object.book === item.book);
    });
    console.log("this is the user cart : ", userCart);
    // Save the updated cart
    const updatedCart = await userCart.save();

    res.status(StatusCodes.OK).json({
        status: 'success',
        data: updatedCart
    });

})
