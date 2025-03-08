import express from 'express';
import validateRequest from '../../../middlewares/validate.request.js';
import {
  createCart,
  deleteCart,
  getAllCarts,
  getCartById,
  updateCart,
  addItems,
  removeItems
} from '../controller/cart.controller.js';
import {
  createCartSchema,
  deleteCartSchema,
  getCartSchema,
  updateCartSchema,
  addToCartSchema
} from '../validation/cart.validation.js';
import CartModel from '../model/cart.model.js';
import authenticateUser from '../../../middlewares/authenticate.user.js';
import checkRole from '../../../middlewares/check.role.js';

const cartRouter = express.Router();

// Middleware object
const validate = {
  create: validateRequest(createCartSchema),
  get: validateRequest(getCartSchema),
  update: validateRequest(updateCartSchema),
  delete: validateRequest(deleteCartSchema),
  addToCart: validateRequest(addToCartSchema)
};

// Common middleware for all routes
cartRouter.use(authenticateUser);

// User routes
cartRouter
  .route('/')
  .post(validate.create, createCart);

cartRouter
  .route('/add-to-cart')
  .put(validate.addToCart, addItems);

cartRouter
  .route('/remove-from-cart')
  .put(validate.addToCart, removeItems);

// Admin routes (with role check)
cartRouter
  .route('/admin')
  .get(checkRole('admin'), getAllCarts);

cartRouter
  .route('/admin/deleteAll')
  .delete(checkRole('admin'), async (req, res) => {
    await CartModel.deleteMany({});
    res.json({ message: "All carts deleted" });
  });

// Individual cart routes
cartRouter
  .route('/:id')
  .get(validate.get, getCartById)
  .put(validate.update, updateCart)
  .delete(validate.delete, deleteCart);

export default cartRouter;