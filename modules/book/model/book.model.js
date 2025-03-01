import mongoose from "mongoose";
import bookSchema from "../schema/book.schema.js"

const BookModel = mongoose.model("Book", bookSchema);

export default BookModel;