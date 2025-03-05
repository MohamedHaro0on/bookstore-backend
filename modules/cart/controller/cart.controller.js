// import createHandler from '../../../utils/factory/create.handler.js';

// import deleteHandler from '../../../utils/factory/delete.handler.js';
import GetByIdHandler from '../../../utils/factory/get.by.id.handler.js';
import GetHandler from '../../../utils/factory/get.handler.js';
import updateHandler from '../../../utils/factory/update.handler.js';
import CartModel from '../model/cart.model.js';

// export const createCart = createHandler(CartModel);

export const getAllCarts = GetHandler(CartModel);

export const getCartById = GetByIdHandler(CartModel);

export const updateCart = updateHandler(CartModel);

// export const deleteCart = deleteHandler(CartModel);
