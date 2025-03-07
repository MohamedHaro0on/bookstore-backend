import express from 'express';
import validateRequest from '../../../middlewares/validate.request.js';
import orderController from '../controller/order.controller.js';
import orderValidation from '../validation/order.validation.js';
import authenticateUser from '../../../middlewares/authicate.user.js';
import CheckPrviousOrders from '../../../middlewares/check.previous.orders.js';
import OrderModel from '../model/order.model.js';

const orderRoutes = express.Router();

orderRoutes.post('/',
    validateRequest(orderValidation.createSchema),
    authenticateUser,
    CheckPrviousOrders,
    orderController.create
);
orderRoutes.delete("/deleteAll", async (req, res, next) => {
    await OrderModel.deleteMany({});
    res.send("ok")
})

orderRoutes.get('/', validateRequest(orderValidation.getAllSchema), orderController.get);
orderRoutes.get('/:id', validateRequest(orderValidation.getByIdSchema), orderController.getById);
orderRoutes.patch('/:id', validateRequest(orderValidation.updateSchema), orderController.update);
orderRoutes.delete('/:id', validateRequest(orderValidation.deleteSchema), orderController.remove);

export default orderRoutes;
