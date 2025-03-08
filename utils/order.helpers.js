import { StatusCodes } from "http-status-codes";
import UserModel from "../modules/user/model/user.model.js";
import ApiError from "./api.error.js";
import BookModel from "../modules/book/model/book.model.js";
import OrderModel from "../modules/order/model/order.model.js";

export const validateUserAndCart = async (userId, session) => {
    const user = await UserModel.findById(userId).session(session);
    if (!user) throw new ApiError("❌ User not found", StatusCodes.NOT_FOUND);
    console.log("this is the user : ", user);
    if (user.cart && user.cart.items.length === 0) throw new ApiError("❌ User cart is empty", StatusCodes.BAD_REQUEST);
    return user;
};

// Update prepareBooksOrdered to fix the author field
export const prepareBooksOrdered = (userCart) =>
    userCart.items.map((item) => ({
        title: item.book.title,
        price: item.book.price,
        author: item.book.author, // Changed from item.book.price
        quantity: item.quantity,
    }));

// Update checkStockAvailability to handle async properlyexport
export const checkStockAvailability = async (userCart) => {
    const errors = [];

    for (const item of userCart.items) {
        if (!item.book) {
            errors.push(`❌ Book with ID ${item._id} not found`);
            continue;
        }

        if (item.book.stock < item.quantity) {
            errors.push(
                `❌ Not enough stock for "${item.book.title}" (Requested: ${item.quantity}, Available: ${item.book.stock})`
            );
        }
    }

    if (errors.length > 0) {
        throw new ApiError(errors.join("\n"), StatusCodes.BAD_REQUEST);
    }
};

// Update updateBookStock to handle async properly
export const updateBookStock = async (userCart, session) => {
    const updates = userCart.items.map(({ book, quantity }) =>
        BookModel.updateOne(
            { _id: book._id },
            { $inc: { stock: -quantity } },
            { session }
        )
    );

    await Promise.all(updates);
}

export const getOrders = async (userId) => {
    const orders = await OrderModel.find({ user: userId })
        .sort({ orderDate: -1 })
        .populate("user", "name email")
        .populate("cart.items", "title description author averageRating")
        .exec();

    if (orders.length === 0)
        throw new ApiError("ℹ️ No orders found for this user", StatusCodes.NOT_FOUND);
    return orders;
};