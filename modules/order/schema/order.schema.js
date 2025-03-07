import mongoose from 'mongoose';
import ApiError from '../../../utils/api.error.js';
import { StatusCodes } from 'http-status-codes';

// Create schema for book item in the order
const orderItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  author: {
    type: String,
    required: true
  }
});

// Create schema order entity
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    books: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (books) => books.length > 0,
        message: 'At least one book is required in the order.'
      }
    },
    totalPrice: {
      type: Number,
      // required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['pending', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

// Add indexes for frequently queried fields
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });

export default orderSchema;