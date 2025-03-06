import Joi from 'joi';
import joiObjectId from 'joi-objectid';

const objectId = joiObjectId(Joi);

const createReviewSchema = {
  body: Joi.object({
    user: objectId().required(),
    book: objectId().required(),
    rating: Joi.number()
      .integer()
      .min(1)
      .max(5)
      .required()
      .messages({'number.base': 'Rating must be a number', 'number.min': 'Rating must be at least 1', 'number.max': 'Rating must be at most 5'}),
    review: Joi.string()
      .max(500)
      .required()
      .messages({'string.max': 'Review must be a string with a maximum length of 500 characters'})
  })
};

const getReviewByIdSchema = {
  params: Joi.object({
    id: objectId().required()
  })
};

const updateReviewSchema = {
  body: Joi.object({
    user: objectId(),
    book: objectId(),
    rating: Joi.number()
      .integer()
      .min(1)
      .max(5)
      .messages({'number.base': 'Rating must be a number', 'number.min': 'Rating must be at least 1', 'number.max': 'Rating must be at most 5'}),
    review: Joi.string()
      .max(500)
      .messages({'string.max': 'Review must be a string with a maximum length of 500 characters'})
  }).min(1)
};

const deleteReviewSchema = {
  body: Joi.object({
    id: objectId().required()
  })
};

export {createReviewSchema, deleteReviewSchema, getReviewByIdSchema, updateReviewSchema};
