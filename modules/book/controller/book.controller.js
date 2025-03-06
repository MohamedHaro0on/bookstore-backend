import createHandler from '../../../utils/factory/create.handler.js';

import deleteHandler from '../../../utils/factory/delete.handler.js';
import GetByIdHandler from '../../../utils/factory/get.by.id.handler.js';
import GetHandler from '../../../utils/factory/get.handler.js';
import updateHandler from '../../../utils/factory/update.handler.js';
import BookModel from '../model/book.model.js';


export const createBook = createHandler(BookModel);

export const getAllBooks = GetHandler(BookModel);

export const getBookById = GetByIdHandler(BookModel);

export const updateBook = updateHandler(BookModel);

export const deleteBook = deleteHandler(BookModel);
