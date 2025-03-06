import express from 'express';
import {validateRequest} from '../../../middlewares/validate.request.js';
import orderController from '../controller/order.controller.js';
import orderValidation from '../validation/order.validation.js';

const router = express.Router();

router.post('/', validateRequest(orderValidation.create), orderController.create);
router.get('/', orderController.get);
router.get('/:id', validateRequest(orderValidation.getById), orderController.getById);
router.patch('/:id', validateRequest(orderValidation.update), orderController.update);
router.delete('/:id', validateRequest(orderValidation.remove), orderController.remove);
