import Joi from 'joi';
import joiObjectId from 'joi-objectid';

// Add objectId validation to Joi
const ObjectId = joiObjectId(Joi);

// Cart Item Schema
const cartItemSchema = Joi.object({
  book: ObjectId().required().messages({
    'any.required': 'book ID is required',
    'string.pattern.name': 'Invalid user ID format'
  }), // MongoDB ObjectId validation
  quantity: Joi.number().integer().min(1).required()
});

export const addToCartSchema = {
  body: Joi.object({
    items: Joi.array().items(cartItemSchema).min(1).required(),
  })
}
// Create Cart Validation Schema
export const createCartSchema = {
  body: Joi.object({
    items: Joi.array().items(cartItemSchema).min(1).required(),
    // totalAmount: Joi.number().min(0).required(),
    status: Joi.string()
      .valid('active', 'abandoned', 'completed')
      .default('active')
  })
};

// Get Cart Validation Schema
export const getCartSchema = {
  params: Joi.object({
    id: ObjectId().required().messages({
      'any.required': 'cart ID is required',
      'string.pattern.name': 'Invalid user ID format'
    }) // MongoDB ObjectId validation
  })
};

// Update Cart Validation Schema
export const updateCartSchema = {
  params: Joi.object({
    id: ObjectId().required().messages({
      'any.required': 'Cart ID is required',
      'string.pattern.name': 'Invalid user ID format'
    })
  }),
  body: Joi.object({
    items: Joi.array().items(cartItemSchema).min(1),
    totalAmount: Joi.number().min(0),
    status: Joi.string().valid('active', 'abandoned', 'completed'),
    couponCode: Joi.string().allow(null, ''),
    discountAmount: Joi.number().min(0),
    expiresAt: Joi.date().greater('now')
  }).min(1) // Require at least one field to be updated
};

// Delete Cart Validation Schema
export const deleteCartSchema = {
  params: Joi.object({
    id: ObjectId().required().messages({
      'any.required': 'cart ID is required',
      'string.pattern.name': 'Invalid user ID format'
    })
  })
};

// Query Validation for getAllCarts (optional)
export const getAllCartsSchema = {
  query: Joi.object({
    status: Joi.string().valid('active', 'abandoned', 'completed'),
    user: Joi.string().hex().length(24),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().valid('createdAt', 'totalAmount', 'updatedAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  })
};

// Additional validation helper (if needed)
export const validateObjectId = (id) => {
  return Joi.string().hex().length(24).validate(id);
};
