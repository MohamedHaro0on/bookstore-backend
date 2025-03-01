import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
    },
    stock: {
      type: Number,
      min: 0,
      default: 0,

    },
    img: {
        type: String, 
      },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review", 
      },
    ],
  },
  {
    timestamps: true, 
  }
);

export default bookSchema;
