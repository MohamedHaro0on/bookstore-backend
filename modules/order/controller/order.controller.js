import process from 'node:process';
import asyncHandler from 'express-async-handler';
import {StatusCodes} from 'http-status-codes';
import Stripe from 'stripe';
import ApiError from '../../../utils/api.error.js';
import GetByIdHandler from '../../../utils/factory/get.by.id.handler.js';
import getHandler from '../../../utils/factory/get.handler.js';
import {checkStockAvailability, prepareBooksOrdered, updateBookStock, validateUserAndCart} from '../../../utils/order.helpers.js';
import OrderModel from '../model/order.model.js';

export const getAll = getHandler(OrderModel);

export const getById = GetByIdHandler(OrderModel);

export const getMyOrders = getHandler(OrderModel, null, true);

export const create = asyncHandler(async (req, res, next) => {
  const {userId} = req.user;
  const session = await OrderModel.startSession();
  session.startTransaction();

  try {
    // Validate user and cart
    const user = await validateUserAndCart(userId, session);

    // Check stock availability
    await checkStockAvailability(user.cart);

    // Prepare books for order
    const booksOrdered = prepareBooksOrdered(user.cart);

    // Calculate total price
    const totalPrice = booksOrdered.reduce((total, item) =>
      total + (item.price * item.quantity), 0);

    // Create order - only save once
    const newOrder = await new OrderModel({
      user: user._id,
      books: booksOrdered,
      totalPrice
    }).save({session});

    // Update book stock
    await updateBookStock(user.cart, session);

    // Clear user's cart
    user.cart.items = [];
    await user.save({session});

    await session.commitTransaction();
    res.status(StatusCodes.CREATED).json({
      status: 'success',
      data: newOrder
    });
  } catch (error) {
    await session.abortTransaction();
    next(new ApiError(error.message, StatusCodes.BAD_REQUEST));
  } finally {
    session.endSession();
  }
});

export const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const {id} = req.params;
  const {status} = req.body;
  const session = await OrderModel.startSession();
  session.startTransaction();

  try {
    const order = await OrderModel.findByIdAndUpdate(
      id,
      {status},
      {new: true, session}
    ).exec();
    if (!order) next(new ApiError('❌ Order not found', StatusCodes.NOT_FOUND));

    if (status === 'canceled')
      await updateBookStock(order.books, session, 'canceled');

    await session.commitTransaction();

    res.status(StatusCodes.ACCEPTED).json({
      message: 'Order Updated Successfully',
      data: order
    });
  } catch (error) {
    await session.abortTransaction();
    next(new ApiError(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
  } finally {
    session.endSession();
  }
});

export const checkout = asyncHandler(async (req, res, next) => {
  const stripe = new Stripe(process.env.SECRET_KEY);
  const {id} = req.params;
  const order = await OrderModel.findById(id).populate('user');
  if (!order) {
    return next(new ApiError('Order is not Found', StatusCodes.NOT_FOUND));
  }
  const user = order.user;
  console.log('this is the order : ', order);
  console.log('this is the total price : ', order.totalPrice);
  console.log('this is the first Name : ', user.firstName, ' last Name : ', user.lastName, 'email : ', user.email);
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'egp',
          unit_amount: order.totalPrice * 100,
          product_data: {
            name: `${user.firstName} ${user.lastName}`
          }
        },
        quantity: 1
      }
    ],
    mode: 'payment',
    success_url: `https://www.google.com`,
    cancel_url: `https://www.google.com`,
    customer_email: user.email,
    client_reference_id: id
  });
  res.status(StatusCodes.ACCEPTED).json({
    message: 'Successfull',
    data: session
  });
});
