import joi from 'joi';
import mongoose from 'mongoose';
import UserModel from '../../user/model/user.model.js';
import OrderModel from '../model/order.model.js';

// Helper function to validate MongoDB ObjectId
const validateObjectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid', {message: `"${helpers.state.path}" must be a valid MongoDB ObjectId`});
  }
  return value;
};

const create = joi.object({
  user: joi.string().required().custom(validateObjectId, 'ObjectId Validation'),
  books: joi.array()
    .items(
      joi.object({
        title: joi.string().required(),
        quantity: joi.number().min(1).required(),
        price: joi.number().min(0).required(),
        author: joi.string().required()
      })
    )
    .required()
    .min(1)
    .messages({
      'array.min': 'At least one book is required in the order.'
    }),
  totalPrice: joi.number().min(0).required(),
  status: joi.forbidden() // Prevent client from sending status during creation
});

const update = joi.object({
  books: joi.array()
    .items(
      joi.object({
        title: joi.string().required(),
        quantity: joi.number().min(1).required(),
        price: joi.number().min(0).required(),
        author: joi.string().required()
      })
    )
    .min(1)
    .messages({
      'array.min': 'At least one book is required in the order.'
    }),
  totalPrice: joi.number().min(0),
  status: joi.string().valid('pending', 'shipped', 'delivered', 'cancelled')
}).custom(async (value, helpers) => {
  // Get the order ID and user ID from the request params
  const orderId = helpers.state.ancestors[0].params.id;
  const userId = helpers.state.ancestors[0].user.id;

  const order = await OrderModel.findById(orderId);
  const user = await UserModel.findById(userId);

  if (!order) {
    return helpers.error('any.invalid', {message: 'Order not found'});
  }

  if (!user) {
    return helpers.error('any.invalid', {message: 'User not found'});
  }

  if (user.role === 'user') {
    if (order.status !== 'pending') {
      return helpers.error('any.invalid', {message: 'Users can only update or cancel orders with "pending" status'});
    }
    if (value.status && value.status !== 'cancelled') {
      return helpers.error('any.invalid', {message: 'Users can only cancel orders with "pending" status'});
    }
  }

  return value;
}, 'Order Update Validation');

const remove = {
  params: joi.object({
    id: joi.string().required().custom(validateObjectId, 'ObjectId Validation')
  }),
  body: joi.object({}).custom(async (value, helpers) => {
    // Get the order ID and user ID from the request params
    const orderId = helpers.state.ancestors[0].params.id;
    const userId = helpers.state.ancestors[0].user.id;

    const order = await OrderModel.findById(orderId);
    const user = await UserModel.findById(userId);

    if (!order) {
      return helpers.error('any.invalid', {message: 'Order not found'});
    }

    if (!user) {
      return helpers.error('any.invalid', {message: 'User not found'});
    }

    if (user.role !== 'admin') {
      return helpers.error('any.invalid', {message: 'Only admins can delete orders'});
    }

    if (order.status !== 'pending' && order.status !== 'cancelled') {
      return helpers.error('any.invalid', {message: 'Orders can only be deleted if the status is "pending" or "cancelled"'});
    }

    return value;
  }, 'Order Delete Validation')
};

// const getAll = joi.object({
//   query: joi.object({
//     status: joi.string().valid('pending', 'shipped', 'delivered', 'cancelled'),
//     sortBy: joi.string().valid('createdAt', 'totalPrice'),
//     sortOrder: joi.string().valid('asc', 'desc'),
//     limit: joi.number().min(1),
//     page: joi.number().min(1)
//   })
// });

const getAll = {
  query: joi.object({}).custom(async (value, helpers) => {
    const req = helpers.state.ancestors[0]; // Access the request object
    const userId = req.user.id; // Get the user ID from the request

    const user = await UserModel.findById(userId);

    if (!user) {
      return helpers.error('any.invalid', {message: 'User not found'});
    }

    if (user.role !== 'admin') {
      return helpers.error('any.invalid', {message: 'Only admins can retrieve all orders'});
    }

    return value;
  }, 'Admin Only Validation')
};

const getById = joi.object({
  params: joi.object({
    id: joi.string().required().custom(validateObjectId, 'ObjectId Validation')
  })
});

export {
  create,
  getAll,
  getById,
  remove,
  update
};
