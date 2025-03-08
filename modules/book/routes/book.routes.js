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
import UploadFile from '../../../middlewares/file.upload.js';
import attachImage from '../../../middlewares/attach.image.js';
import authenticateUser from '../../../middlewares/authenticate.user.js';
import checkRole from '../../../middlewares/check.role.js';

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
  .post(authenticateUser, checkRole('admin'), validate.create, createBook)
  .get(getAllBooks);

bookRouter
  .route('/:id')
  .get(validate.get, getBookById)
  .put(authenticateUser, checkRole('admin'), UploadFile("img", "books"), attachImage('img'), validate.update, updateBook)
  .delete(authenticateUser, checkRole('admin'), validate.delete, deleteBook);

export default bookRouter;