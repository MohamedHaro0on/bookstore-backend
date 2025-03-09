import express from 'express';
import validateRequest from '../../../middlewares/validate.request.js';
import { cacheByIdMiddleware, cacheAllMiddleware } from '../../../middlewares/cache.js';
import BookModel from '../model/book.model.js'
import {
  create,
  getAll,
  getById,
  remove,
  update
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
  .post(
    authenticateUser,
    UploadFile("img", "books"),
    attachImage('img'),
    checkRole('admin'),
    validate.create,
    create
  )
  .get(cacheAllMiddleware(BookModel), getAll);

bookRouter
  .route('/:id')
  .get(validate.get, cacheByIdMiddleware(BookModel), getById)
  .put(
    authenticateUser,
    UploadFile("img", "books"),
    attachImage('img'),
    checkRole('admin'),
    validate.update,
    update
  )
  .delete(
    authenticateUser,        // First authenticate
    checkRole('admin'),      // Then check role
    validate.delete,
    remove
  );

export default bookRouter;