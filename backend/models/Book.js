const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, trim: true },
  stock: { type: Number, default: 0, min: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Book", bookSchema);
