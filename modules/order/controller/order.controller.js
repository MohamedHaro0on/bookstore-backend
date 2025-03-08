import asyncHandler from "express-async-handler";
import Order from "../model/order.model.js";
import ApiError from "../../../utils/api.error.js";
import OrderModel from "../model/order.model.js";
import GetByIdHandler from "../../../utils/factory/get.by.id.handler.js";
import { StatusCodes } from "http-status-codes";
import { checkStockAvailability, prepareBooksOrdered, updateBookStock, validateUserAndCart } from "../../../utils/order.helpers.js";
import getHandler from "../../../utils/factory/get.handler.js";


export const create = asyncHandler(async (req, res, next) => {
  const { userId } = req.user;
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
      total + (item.price * item.quantity), 0
    );

    // Create order - only save once
    const newOrder = await new OrderModel({
      user: user._id,
      books: booksOrdered,
      totalPrice,
    }).save({ session });

    // Update book stock
    await updateBookStock(user.cart, session);

    // Clear user's cart
    user.cart.items = [];
    await user.save({ session });

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


export const getAll = getHandler(OrderModel);

export const getById = GetByIdHandler(OrderModel);

export const getMyOrders = getHandler(OrderModel, null, true);



export const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { id: orderId } = req.params;
  const { status } = req.body;
  const session = await OrderModel.startSession();
  session.startTransaction();

  try {
    const order = await OrderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true, session }
    )
      .populate({
        path: "items.book",
        select: "title",
      })
      .populate({
        path: "user",
        select: "name email",
      })
      .exec();
    if (!order) next(new ApiError("❌ Order not found", StatusCodes.NOT_FOUND));

    if (status === "canceled")
      await updateBookStock(order.books, session, "canceled");

    await session.commitTransaction();

    res.status(StatusCodes.ACCEPTED).json({
      message: "Order Updated Successfully",
      data: order
    });
  } catch (error) {
    await session.abortTransaction();
    next(new ApiError(error.message, StatusCodes.INTERNAL_SERVER_ERROR));
  } finally {
    session.endSession();
  }
});

