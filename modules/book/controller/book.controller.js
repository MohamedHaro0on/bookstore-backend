import BookModel from "../model/book.model.js";

import createHandler from "../../../handlers/create.handler.js";
import GetByIdHandler from "../../../handlers/get.by.id.handler.js";
import GetHandler from "../../../handlers/get.handler.js";
import updateHandler from "../../../handlers/update.handler.js";
import deleteHandler from "../../../handlers/delete.handler.js";


export const createBook = createHandler(BookModel);


export const getAllBooks = GetHandler(BookModel);


export const getBookById = GetByIdHandler(BookModel);


export const updateBook = updateHandler(BookModel);


export const deleteBook = deleteHandler(BookModel);
