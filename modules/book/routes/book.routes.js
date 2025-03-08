import express from 'express';
import validateRequest from '../../../middlewares/validate.request.js';
import {
  createBook,
  deleteBook,
  getAllBooks,
  getBookById,
  updateBook
} from '../controller/book.controller.js';
import {
  createBookSchema,
  deleteBookSchema,
  getBookSchema,
  updateBookSchema
} from '../validation/book.validation.js';

const bookRouter = express.Router();

// Middleware object for cleaner code
const validate = {
  create: validateRequest(createBookSchema),
  get: validateRequest(getBookSchema),
  update: validateRequest(updateBookSchema),
  delete: validateRequest(deleteBookSchema)
};

// Chain routes with middleware object
bookRouter
  .route('/')
  .post(validate.create, createBook)
  .get(getAllBooks);

bookRouter
  .route('/:id')
  .get(validate.get, getBookById)
  .put(validate.update, updateBook)
  .delete(validate.delete, deleteBook);

export default bookRouter;