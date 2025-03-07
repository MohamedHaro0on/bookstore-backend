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
import authenticateUser from '../../../middlewares/authicate.user.js';

const cartRouter = express.Router();

cartRouter.post('/',
  validateRequest(createCartSchema),
  authenticateUser,
  createCart
);

cartRouter.put("/add-to-cart",
  validateRequest(addToCartSchema),
  authenticateUser,
  addItems,
)

cartRouter.put("/remove-from-cart",
  validateRequest(addToCartSchema),
  authenticateUser,
  removeItems,
)


cartRouter.delete("/deleteAll", async (req, res) => {
  await CartModel.deleteMany({});
  res.json({ message: "All carts deleted" });
}
);

// admin Routes :

cartRouter.get('/', getAllCarts);


cartRouter.get('/:id', validateRequest(getCartSchema), authenticateUser, getCartById);


cartRouter.put('/:id', validateRequest(updateCartSchema), authenticateUser, updateCart);


cartRouter.put('/:id', validateRequest(updateCartSchema), authenticateUser, updateCart);

cartRouter.delete('/:id', validateRequest(deleteCartSchema), authenticateUser, deleteCart);

export default cartRouter;
