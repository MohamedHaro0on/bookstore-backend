import express from 'express';
import {
  createBook,
  deleteBook,
  getAllBooks,
  getBookById,
  updateBook
} from '../controller/book.controller.js';

const bookRouter = express.Router();

bookRouter.post('/', createBook);
bookRouter.get('/', getAllBooks);
bookRouter.get('/:id', getBookById);
bookRouter.put('/:id', updateBook);
bookRouter.delete('/:id', deleteBook);

export default bookRouter;
