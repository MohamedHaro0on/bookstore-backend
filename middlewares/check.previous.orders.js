import expressAsyncHandler from "express-async-handler";
import OrderModel from "../modules/order/model/order.model.js";
import ApiError from "../utils/api.error.js";
import { StatusCodes } from "http-status-codes";


const CheckPrviousOrders = expressAsyncHandler(async (req, res, next) => {
    const { user } = req.body;
    const oldOrders = await OrderModel.findOne({ user, status: 'pending' })
    if (oldOrders) {
        return next(new ApiError("User's already has pending orders ", StatusCodes.NOT_ACCEPTABLE));
    }
    return next();
})

export default CheckPrviousOrders;