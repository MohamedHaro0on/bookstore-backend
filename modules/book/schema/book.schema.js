import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    author: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    description: {
      type: String
    },
    stock: {
      type: Number,
      min: 0,
      default: 0
    },
    img: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true,
    toObject: {virtuals: true},
    toJSON: {virtuals: true}
  }
);

// Virtual field for reviews
bookSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'book'
});

// Middleware to automatically populate reviews
bookSchema.pre(['find', 'findOne', 'findById'], function (next) {
  this.populate('reviews');
  next();
});

export default bookSchema;
