import express from 'express';
import {
  createBook,
  deleteBook,
  getAllBooks,
  getBookById,
  updateBook
} from '../controller/book.controller.js';
import validateRequest from '../../../middlewares/validate.request.js'
import { createBookSchema } from '../validation/book.validation.js';

const bookRouter = express.Router();

bookRouter.post('/', validateRequest(createBookSchema), createBook);
bookRouter.get('/', getAllBooks);
bookRouter.get('/:id', getBookById);
bookRouter.put('/:id', updateBook);
bookRouter.delete('/:id', deleteBook);

export default bookRouter;
