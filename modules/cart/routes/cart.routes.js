import express from 'express';
import validateRequest from '../../../middlewares/validate.request.js';
import {
  // createCart,
  // deleteCart,
  getAllCarts,
  getCartById,
  updateCart
} from '../controller/cart.controller.js';
import {
  // createCartSchema,
  // deleteCartSchema,
  getCartSchema,
  updateCartSchema
} from '../validation/cart.validation.js';

const cartRouter = express.Router();

// cartRouter.post('/', validateRequest(createCartSchema), createCart);
cartRouter.get('/', getAllCarts);
cartRouter.get('/:id', validateRequest(getCartSchema), getCartById);
cartRouter.put('/:id', validateRequest(updateCartSchema), updateCart);
// cartRouter.delete('/:id', validateRequest(deleteCartSchema), deleteCart);

export default cartRouter;
