import expressAsyncHandler from 'express-async-handler';
import createHandler from '../../../utils/factory/create.handler.js';

import deleteHandler from '../../../utils/factory/delete.handler.js';
import GetByIdHandler from '../../../utils/factory/get.by.id.handler.js';
import GetHandler from '../../../utils/factory/get.handler.js';
import updateHandler from '../../../utils/factory/update.handler.js';
import CartModel from '../model/cart.model.js';
import ApiError from '../../../utils/api.error.js';
import { StatusCodes } from 'http-status-codes';
import getHandler from '../../../utils/factory/get.handler.js';

export const createCart = createHandler(CartModel);

export const getAllCarts = GetHandler(CartModel);

export const getCartById = GetByIdHandler(CartModel);

export const updateCart = updateHandler(CartModel);

export const deleteCart = deleteHandler(CartModel);


export const addItems = expressAsyncHandler(async (req, res, next) => {
    const { user } = req;
    const { items } = req.body;
    const userCart = await CartModel.findOne({ user: user.userId, status: "active" })
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
    const { user } = req;
    const { items } = req.body;
    const userCart = await CartModel.findOne({ user: user.userId, status: "active" })
    if (!userCart) {
        return next(new ApiError("user's cart is not found ", StatusCodes.BAD_REQUEST))
    }

    userCart.items = userCart.items.filter(item => {
        items.includes(object => object.book === item.book);
    });
    // Save the updated cart
    const updatedCart = await userCart.save();

    res.status(StatusCodes.OK).json({
        status: 'success',
        data: updatedCart
    });

})

export const getMyCart = getHandler(CartModel, null, true);