import express from 'express';
import validateRequest from '../../../middlewares/validate.request.js';
import {
  createCart,
  deleteCart,
  getAllCarts,
  getCartById,
  updateCart
} from '../controller/cart.controller.js';
import {
  createCartSchema,
  deleteCartSchema,
  getCartSchema,
  updateCartSchema
} from '../validation/cart.validation.js';
import CartModel from '../model/cart.model.js';
import authenticateUser from '../../../middlewares/authicate.user.js';

const cartRouter = express.Router();

cartRouter.post('/',
  validateRequest(createCartSchema),
  authenticateUser,
  createCart
);

cartRouter.get('/', getAllCarts);

cartRouter.delete("/deleteAll", async (req, res) => {
  await CartModel.deleteMany({});
  res.json({ message: "All carts deleted" });
}
);

cartRouter.get('/:id', validateRequest(getCartSchema), authenticateUser, getCartById);
cartRouter.put('/:id', validateRequest(updateCartSchema), authenticateUser, updateCart);
cartRouter.delete('/:id', validateRequest(deleteCartSchema), authenticateUser, deleteCart);

export default cartRouter;
