import mongoose from 'mongoose';
import BookModel from '../../book/model/book.model.js';
import GetByIdHandler from '../../utils/factory/get.by.id.handler.js';
import GetHandler from '../../utils/factory/get.handler.js';
import OrderModel from '../model/order.model.js';

const create = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {user, books, totalPrice} = req.body;

    // Step 1: Create the order
    const order = new OrderModel({
      user,
      books,
      totalPrice,
      status: 'pending'
    });

    // Save the order within the transaction
    await order.save({session});

    // Step 2: Update the inventory for each book
    for (const bookItem of books) {
      const book = await BookModel.findById(bookItem.bookId).session(session);
      if (!book) {
        throw new Error(`Book with ID ${bookItem.bookId} not found`);
      }

      if (book.quantity < bookItem.quantity) {
        throw new Error(`Insufficient quantity for book: ${book.title}`);
      }

      // Reduce the book's quantity
      book.quantity -= bookItem.quantity;
      await book.save({session});
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({success: true, data: order});
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    // Pass the error to the error handler
    next(error);
  }
};

const update = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {id} = req.params;
    const {status} = req.body;

    const order = await OrderModel.findById(id).session(session);
    if (!order) {
      throw new Error('Order not found');
    }

    // Update the order status
    order.status = status;
    await order.save({session});

    // Restore inventory if the order is cancelled
    if (status === 'cancelled') {
      for (const bookItem of order.books) {
        const book = await BookModel.findById(bookItem.bookId).session(session);
        if (!book) {
          throw new Error(`Book with ID ${bookItem.bookId} not found`);
        }

        // Restore the book's quantity
        book.quantity += bookItem.quantity;
        await book.save({session});
      }
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({success: true, data: order});
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
    const {id} = req.params;

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
      await book.save({session});
    }

    // Delete the order
    await OrderModel.deleteOne({_id: id}).session(session);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({success: true, data: null});
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
