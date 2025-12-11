const Order = require("../models/Order");
const Book = require("../models/Book");
const mongoose = require("mongoose");

// Create order (status default pending)
exports.createOrder = async (req, res) => {
  try {
    const { bookId, qty } = req.body;
    if (!bookId) return res.status(400).json({ message: "bookId required" });
    if (!qty || qty <= 0) return res.status(400).json({ message: "qty must be > 0" });

    // ensure book exists
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });

    const order = await Order.create({ bookId, qty }); // default status pending
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("bookId").sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Confirm order: atomically decrease stock and set status to confirmed
exports.confirmOrder = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const order = await Order.findById(req.params.id).session(session);
    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.status === "confirmed") {
      await session.abortTransaction();
      return res.status(400).json({ message: "Order already confirmed" });
    }

    // Try decrease stock atomically: find book with enough stock and decrement
    const book = await Book.findOneAndUpdate(
      { _id: order.bookId, stock: { $gte: order.qty } },
      { $inc: { stock: -order.qty } },
      { new: true, session }
    );

    if (!book) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Insufficient stock" });
    }

    order.status = "confirmed";
    await order.save({ session });

    await session.commitTransaction();
    res.json({ message: "Order confirmed", order, book });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
  }
};
