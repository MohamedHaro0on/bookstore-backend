import mongoose from "mongoose";
import CartSchema from "../schema/cart.schema.js";

const CartModel = mongoose.model("Cart", CartSchema);

export default CartModel;
