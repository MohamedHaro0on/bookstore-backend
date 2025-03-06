import createHandler from '../../../utils/factory/create.handler.js';
import deleteHandler from '../../../utils/factory/delete.handler.js';
import GetByIdHandler from '../../../utils/factory/get.by.id.handler.js';
import GetHandler from '../../../utils/factory/get.handler.js';
import updateHandler from '../../../utils/factory/update.handler.js';
import ReviewModel from '../model/review.model.js';


const removeAttr = "-createdAt -updatedAt -__v";
const getFullInfo = [
  { path: "user", select: removeAttr }, // Populate the user field
  { path: "book", select: removeAttr }, // Populate the book field
];

const create = createHandler(ReviewModel);
const get = GetHandler(ReviewModel, getFullInfo);
const getById = GetByIdHandler(ReviewModel, getFullInfo);
const update = updateHandler(ReviewModel);
const remove = deleteHandler(ReviewModel);

export default {
  create,
  get,
  getById,
  update,
  remove
};
