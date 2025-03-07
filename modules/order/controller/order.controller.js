// core modules + 3d party modules :
import mongoose from 'mongoose';
import ApiError from '../../../utils/api.error.js';
import { StatusCodes } from 'http-status-codes';
import expressAsyncHandler from 'express-async-handler';
// user modules :
import BookModel from '../../book/model/book.model.js';
import GetByIdHandler from '../../../utils/factory/get.by.id.handler.js';
import GetHandler from '../../../utils/factory/get.handler.js';
import OrderModel from '../model/order.model.js';
import UserModel from '../../user/model/user.model.js';
import CartModel from '../../cart/model/cart.model.js';


const create = expressAsyncHandler(async (req, res, next) => {
  console.log("we are here : ", req.body)
  const { user } = req.body;

  let detailedUser = await UserModel.findById(user);
  console.log("this is the user : ", user);

  let orderItems = detailedUser.cart.items;
  console.log("order Items : ", orderItems);
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    // Step 1: Create the order

    orderItems.forEach(({ book, quantity }) => {
      if (book.stock < quantity) {
        return next(new ApiError(`book ${book.name} stock is less than ${quantity}`));
      }
    })

    let totalPrice = 0;
    const books = orderItems.map(({ book }, index) => {
      totalPrice += (orderItems[index].quantity * book.price)
      return ({
        title: book.title,
        author: book.author,
        quantity: orderItems[index].quantity,
        price: book.price,
      })
    });

    let newOrder = await OrderModel.create({
      user, books, totalPrice
    })
    // Step 3: Update book stock
    for (const { book, quantity } of orderItems) {
      let updatedBooks = await BookModel.updateOne(
        { _id: book._id },
        { $inc: { stock: -quantity } },
        { session }
      );
      console.log("this is the updated books : ", updatedBooks);
    }
    // delete the user's cart .
    const deletedCart = await CartModel.findOneAndDelete({ user })
    console.log("i am here ")
    // Commit the transaction
    await session.commitTransaction();
    res.status(StatusCodes.CREATED).json({ success: true, data: newOrder });
  } catch (error) {
    // Abort the transaction on error
    console.log("this is the error : ", error)
    await session.abortTransaction();

    return next(new ApiError(`${error}`, StatusCodes.CONFLICT));

  } finally {
    // End the session
    session.endSession();
  }
});

const update = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await OrderModel.findById(id).session(session);
    if (!order) {
      throw new Error('Order not found');
    }

    // Update the order status
    order.status = status;
    await order.save({ session });

    // Restore inventory if the order is cancelled
    if (status === 'cancelled') {
      for (const bookItem of order.books) {
        const book = await BookModel.findById(bookItem.bookId).session(session);
        if (!book) {
          throw new Error(`Book with ID ${bookItem.bookId} not found`);
        }

        // Restore the book's quantity
        book.quantity += bookItem.quantity;
        await book.save({ session });
      }
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    // Pass the error to the error handler
    next(error);
  }
};

const remove = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    const order = await OrderModel.findById(id).session(session);
    if (!order) {
      throw new Error('Order not found');
    }

    // Restore inventory
    for (const bookItem of order.books) {
      const book = await BookModel.findById(bookItem.bookId).session(session);
      if (!book) {
        throw new Error(`Book with ID ${bookItem.bookId} not found`);
      }

      // Restore the book's quantity
      book.quantity += bookItem.quantity;
      await book.save({ session });
    }

    // Delete the order
    await OrderModel.deleteOne({ _id: id }).session(session);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, data: null });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    // Pass the error to the error handler
    next(error);
  }
};

const get = GetHandler(OrderModel);
const getById = GetByIdHandler(OrderModel);

export default {
  create,
  get,
  getById,
  update,
  remove
};
