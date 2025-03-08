import express from 'express';
import validateRequest from '../../../middlewares/validate.request.js';
import {
  createCart,
  deleteCart,
  getAllCarts,
  getCartById,
  updateCart,
  addItems,
  removeItems,
  getMyCart
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
// cartRouter.use(authenticateUser);

// User routes
cartRouter
  .route('/')
  .post(authenticateUser, validate.create, createCart);

cartRouter
  .route('/add-to-cart')
  .put(authenticateUser, validate.addToCart, addItems);

cartRouter
  .route('/remove-from-cart')
  .put(authenticateUser, validate.addToCart, removeItems);

// Admin routes (with role check)
cartRouter
  .route('/admin')
  .get(authenticateUser, checkRole('admin'), getAllCarts);

cartRouter
  .route('/admin/deleteAll')
  .delete(authenticateUser, checkRole('admin'), async (req, res) => {
    await CartModel.deleteMany({});
    res.json({ message: "All carts deleted" });
  });

cartRouter
  .route('/my-cart')
  .get(authenticateUser, getMyCart);
// Individual cart routes
cartRouter
  .route('/:id')
  .get(authenticateUser, validate.get, getCartById)
  .put(authenticateUser, validate.update, updateCart)
  .delete(authenticateUser, validate.delete, deleteCart);

export default cartRouter;