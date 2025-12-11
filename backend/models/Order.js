const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  qty: { type: Number, required: true, min: 1 },
  status: { type: String, enum: ["pending", "confirmed"], default: "pending" }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
