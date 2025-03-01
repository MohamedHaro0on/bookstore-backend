import mongoose from "mongoose";
import BookSchema from "../schema/book.schema.js"

const BookModel = mongoose.BookModel("Book", BookSchema);

export default BookModel;