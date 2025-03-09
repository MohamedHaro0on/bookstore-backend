import expressAsyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';


import createHandler from '../../../utils/factory/create.handler.js';
import deleteHandler from '../../../utils/factory/delete.handler.js';
import GetByIdHandler from '../../../utils/factory/get.by.id.handler.js';
import GetHandler from '../../../utils/factory/get.handler.js';
import updateHandler from '../../../utils/factory/update.handler.js';
import CartModel from '../model/cart.model.js';
import getHandler from '../../../utils/factory/get.handler.js';

export const createCart = createHandler(CartModel);

export const getAllCarts = GetHandler(CartModel);

export const getCartById = GetByIdHandler(CartModel);

export const updateCart = updateHandler(CartModel);

export const deleteCart = deleteHandler(CartModel);


export const addItems = expressAsyncHandler(async (req, res, next) => {
    const { user } = req;
    const { items } = req.body;

    // Find cart and update or create if doesn't exist
    const updatedCart = await CartModel.findOneAndUpdate(
        { user: user.userId },
        {
            $push: { items: { $each: items } },
            $setOnInsert: { status: "active" }
        },
        {
            new: true,
            upsert: true,
            runValidators: true
        }
    );

    res.status(StatusCodes.OK).json({
        status: 'success',
        data: updatedCart
    });
});



export const removeItems = expressAsyncHandler(async (req, res, next) => {
    const { user } = req;
    const { items } = req.body;
    const bookIdsToRemove = items.map(item => item.book);
    const updatedCart = await CartModel.findOneAndUpdate(
        {
            user: user.userId,
            status: "active"
        },
        {
            $pull: {
                items: {
                    book: { $in: bookIdsToRemove }
                }
            },
            $set: {
                updatedAt: new Date()
            }
        },
        {
            new: true,
            runValidators: true
        }
    ).populate('items.book');

    res.status(StatusCodes.OK).json({
        status: 'success',
        data: updatedCart
    });

})

export const getMyCart = getHandler(CartModel, null, true);