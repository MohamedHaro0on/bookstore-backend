import Joi from 'joi';
import joiObjectId from 'joi-objectid';

// Add objectId validation to Joi
const ObjectId = joiObjectId(Joi);
export const createBookSchema = Joi.object({
  title: Joi.string().required(),
  author: Joi.string().required(),
  price: Joi.number().min(0).required(),
  description: Joi.string().optional().allow(''),
  stock: Joi.number().min(0).default(0),
  img: Joi.string().optional().allow(''),
  reviews: Joi.array().items(Joi.string().length(24)).optional()
});

export const updateBookSchema = {
  body: Joi.object({
    title: Joi.string(),
    author: Joi.string(),
    price: Joi.number().min(0),
    description: Joi.string().optional().allow(''),
    stock: Joi.number().min(0).default(0),
    img: Joi.string().optional().allow(''),
    reviews: Joi.array().items(Joi.string().length(24)).optional()
  }), params: Joi.object({
    id: ObjectId().required().messages({
      'any.required': 'book ID is required',
      'string.pattern.name': 'Invalid book ID format'
    })
  })
};

export const getBookSchema = {
  params: Joi.object({
    id: ObjectId().required().messages({
      'any.required': 'Book ID is required',
      'string.pattern.name': 'Invalid book ID format'
    })
  })
};

export const deleteBookSchema = {
  params: Joi.object({
    id: ObjectId().required().messages({
      'any.required': 'Book ID is required',
      'string.pattern.name': 'Invalid book ID format'
    })
  })
};
