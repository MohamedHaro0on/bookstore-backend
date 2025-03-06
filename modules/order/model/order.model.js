import mongoose from 'mongoose';
import orderSchema from '../schema/order.schema.js';

const OrderModel = mongoose.model('Order', orderSchema);

export default OrderModel;
