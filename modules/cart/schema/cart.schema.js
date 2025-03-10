import mongoose from 'mongoose';
import BookModel from '../../book/model/book.model.js';

const CartItemSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
    // unique: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  itemTotal: {
    type: Number,
    required: true,
    default: 0
  }
});

const CartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
    // required: true,
    // unique: true
  },
  items: {
    type: [CartItemSchema],
    validate: {
      validator(items) {
        if (items.length > 0) {
          const bookIds = items.map((item) => item.book.toString());
          return new Set(bookIds).size === bookIds.length;
        }
      },
      message: 'Duplicate books are not allowed in the cart'
    }
  },
  cartTotalPrice: {
    type: Number,
    required: true,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 7 * 24 * 60 * 60 * 1000)
  }
});

// Calculate item total price
async function calculateItemPrice(item) {
  const book = await BookModel.findById(item.book);
  if (!book) {
    throw new Error('Book not found');
  }
  item.price = book.price; // Set the individual item price
  item.itemTotal = book.price * item.quantity; // Calculate total for this item
  return item;
}

// Pre-save middleware for the main cart
CartSchema.pre('save', async function (next) {
  try {
    this.updatedAt = new Date();

    if (this.items && this.items.length > 0) {
      // Process all items in parallel
      await Promise.all(
        this.items.map(async (item) => {
          await calculateItemPrice(item);
        })
      );

      // Calculate total cart price
      this.cartTotalPrice = this.items.reduce((total, item) => {
        return total + item.itemTotal; // Use itemTotal instead of totalPrice
      }, 0);
    }

    next();
  } catch (error) {
    next(error);
  }
});

export default CartSchema;
