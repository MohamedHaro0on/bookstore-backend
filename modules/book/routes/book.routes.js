import express from 'express';
import validateRequest from '../../../middlewares/validate.request.js';
import {
  createBook,
  deleteBook,
  getAllBooks,
  getBookById,
  updateBook
} from '../controller/book.controller.js';
import {createBookSchema, deleteBookSchema, getBookSchema, updateBookSchema} from '../validation/book.validation.js';

const bookRouter = express.Router();

bookRouter.post('/', validateRequest(createBookSchema), createBook);
bookRouter.get('/', getAllBooks);
bookRouter.get('/:id', validateRequest(getBookSchema), getBookById);
bookRouter.put('/:id', validateRequest(updateBookSchema), updateBook);
bookRouter.delete('/:id', validateRequest(deleteBookSchema), deleteBook);

export default bookRouter;
