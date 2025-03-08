import asyncHandler from "express-async-handler";
import User from "../../user/model/user.model.js";
import Book from "../../book/model/book.model.js";
import Order from "../model/order.model.js";
import ApiError from "../../../utils/api.error.js";

const validateUserAndCart = async (userId, session) => {
  const user = await User.findById(userId).session(session);
  if (!user) throw new ApiError("❌ User not found", 404);
  console.log("this is the user : ", user);
  if (user.cart && user.cart.items.length === 0) throw new ApiError("❌ User cart is empty", 400);
  return user;
};

// Update prepareBooksOrdered to fix the author field
const prepareBooksOrdered = (userCart) =>
  userCart.items.map((item) => ({
    title: item.book.title,
    price: item.book.price,
    author: item.book.author, // Changed from item.book.price
    quantity: item.quantity,
  }));

// Update checkStockAvailability to handle async properly
const checkStockAvailability = async (userCart) => {
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
    throw new ApiError(errors.join("\n"), 400);
  }
};

// Update updateBookStock to handle async properly
const updateBookStock = async (userCart, session) => {
  const updates = userCart.items.map(({ book, quantity }) =>
    Book.updateOne(
      { _id: book._id },
      { $inc: { stock: -quantity } },
      { session }
    )
  );

  await Promise.all(updates);
}

const getOrders = async (userId) => {
  const userExists = await User.exists({ _id: userId }).exec();
  if (!userExists) throw new ApiError("❌ User does not exist", 404);

  const orders = await Order.find({ user: userId })
    .sort({ orderDate: -1 })
    .populate("user", "name email")
    .populate("books.book", "title description author averageRating")
    .exec();

  if (orders.length === 0)
    throw new ApiError("ℹ️ No orders found for this user", 404);

  return orders;
};

export const create = asyncHandler(async (req, res, next) => {
  const userId = req.body.user;
  const session = await Order.startSession();
  session.startTransaction();

  try {
    // Validate user and cart
    const user = await validateUserAndCart(userId, session);

    // Check stock availability
    await checkStockAvailability(user.cart);

    // Prepare books for order
    const booksOrdered = prepareBooksOrdered(user.cart);

    // Calculate total price
    const totalPrice = booksOrdered.reduce((total, item) =>
      total + (item.price * item.quantity), 0
    );

    // Create order - only save once
    const newOrder = await new Order({
      user: user._id,
      books: booksOrdered,
      totalPrice,
      status: 'pending'
    }).save({ session });

    // Update book stock
    await updateBookStock(user.cart, session);

    // Clear user's cart
    user.cart.items = [];
    await user.save({ session });

    await session.commitTransaction();
    res.status(201).json({
      status: 'success',
      data: newOrder
    });

  } catch (error) {
    await session.abortTransaction();
    next(new ApiError(error.message, 400));
  } finally {
    session.endSession();
  }
});
export const getAllOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find()
    .populate("books.book", "title description author averageRating")
    .exec();
  if (!orders.length) next(new ApiError("❌ Orders not found", 404));
  res.status(200).json({ result: orders.length, data: orders });
});

export const getOrderById = asyncHandler(async (req, res, next) => {
  const { id: orderId } = req.params;
  const order = await Order.findById(orderId)
    .populate("books.book", "title description author averageRating")
    .exec();
  if (!order) next(new ApiError("❌ Order not found", 404));
  res.status(200).json(order);
});

export const getOrdersByUserId = asyncHandler(async (req, res, next) => {
  const orders = await getOrders(req.params.id);
  if (!orders) next(new ApiError("Order not found", 404));
  res.status(200).json({
    result: orders.length,
    message: "📦 Orders retrieved successfully!",
    data: orders,
  });
});

export const getMyOrders = asyncHandler(async (req, res, next) => {
  const orders = await getOrders(req.user._id);
  if (!orders) next(new ApiError("Order not found", 404));
  res.status(200).json({
    result: orders.length,
    message: "📦 Orders retrieved successfully!",
    data: orders,
  });
});

export const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { id: orderId } = req.params;
  const { status } = req.body;

  const session = await Order.startSession();
  session.startTransaction();

  try {
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true, session }
    )
      .populate({
        path: "books.book",
        select: "title",
      })
      .populate({
        path: "user",
        select: "name email",
      })
      .exec();
    if (!order) next(new ApiError("❌ Order not found", 404));

    if (status === "canceled")
      await updateBookStock(order.books, session, "canceled");

    await session.commitTransaction();

    res.status(200).json(order);

    setImmediate(async () => {
      try {
        const statusUpdateHtml = getStatusUpdateEmail(order.user.name, order);
        // await sendEmail({
        //   email: order.user.email,
        //   subject: `Order #${order._id} Status Update`,
        //   message: statusUpdateHtml,
        // });
      } catch (err) {
        console.error("Email sending failed:", err);
      }
    });
  } catch (error) {
    await session.abortTransaction();
    next(new ApiError(error.message, 404));
  } finally {
    session.endSession();
  }
});