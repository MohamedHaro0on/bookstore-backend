import express from 'express';
import validateRequest from '../../../middlewares/validate.request.js';
import { create, getAll, getById, updateOrderStatus } from '../controller/order.controller.js';
import orderValidation from '../validation/order.validation.js';
import CheckPreviousOrders from '../../../middlewares/check.previous.orders.js';
import OrderModel from '../model/order.model.js';
import authenticateUser from '../../../middlewares/authenticate.user.js';

const orderRouter = express.Router();

// Middleware object
const validate = {
    create: validateRequest(orderValidation.createSchema),
    getAll: validateRequest(orderValidation.getAllSchema),
    getById: validateRequest(orderValidation.getByIdSchema),
    update: validateRequest(orderValidation.updateOrderStatusSchema),
    delete: validateRequest(orderValidation.deleteSchema)
};

// Common middleware
orderRouter.use(authenticateUser);

// Order routes
orderRouter
    .route('/')
    .post(validate.create, CheckPreviousOrders, create)
    .get(validate.getAll, getAll);


orderRouter
    .route('/:id')
    .get(validate.getById, getById)
    .patch(validate.update, updateOrderStatus)
// .delete(validate.delete, remove);


// Admin routes
orderRouter
    .route('/admin')
    .get(async (req, res) => {
        const orders = await OrderModel.find({});
        res.json({
            status: 'success',
            data: orders
        });
    });

orderRouter
    .route('/admin/deleteAll')
    .delete(async (req, res) => {
        await OrderModel.deleteMany({});
        res.status(200).json({
            status: 'success',
            message: 'All orders deleted successfully'
        });
    });



// orderRoutes.get('/', validateRequest(orderValidation.getAllSchema), orderController.get);
// orderRoutes.get('/:id', validateRequest(orderValidation.getByIdSchema), orderController.getById);
// orderRoutes.patch('/:id', validateRequest(orderValidation.updateSchema), orderController.update);
// orderRoutes.delete('/:id', validateRequest(orderValidation.deleteSchema), orderController.remove);

export default orderRouter;


