import createHandler from '../../../utils/factory/create.handler.js';

import deleteHandler from '../../../utils/factory/delete.handler.js';
import GetByIdHandler from '../../../utils/factory/get.by.id.handler.js';
import GetHandler from '../../../utils/factory/get.handler.js';
import updateHandler from '../../../utils/factory/update.handler.js';
import BookModel from '../model/book.model.js';

export const create = createHandler(BookModel);

export const getAll = GetHandler(BookModel);

export const getById = GetByIdHandler(BookModel);

export const update = updateHandler(BookModel);

export const remove = deleteHandler(BookModel);
