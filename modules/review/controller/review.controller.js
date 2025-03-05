import createHandler from '../../../utils/factory/create.handler.js';
import deleteHandler from '../../../utils/factory/delete.handler.js';
import GetByIdHandler from '../../../utils/factory/get.by.id.handler.js';
import GetHandler from '../../../utils/factory/get.handler.js';
import updateHandler from '../../../utils/factory/update.handler.js';
import ReviewModel from '../model/review.model.js';

const create = createHandler(ReviewModel);
const get = GetHandler(ReviewModel);
const getById = GetByIdHandler(ReviewModel);
const update = updateHandler(ReviewModel);
const remove = deleteHandler(ReviewModel);

export default {
  create,
  get,
  getById,
  update,
  remove
};
