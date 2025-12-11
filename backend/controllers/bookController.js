const Book = require("../models/Book");

// Create book
exports.createBook = async (req, res) => {
  try {
    const { title, author, stock = 0 } = req.body;
    if (!title) return res.status(400).json({ message: "Title required" });

    const book = await Book.create({ title, author, stock });
    res.status(201).json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all / search by title
exports.getBooks = async (req, res) => {
  try {
    const { q } = req.query;
    const filter = q ? { title: new RegExp(q, "i") } : {};
    const books = await Book.find(filter).sort({ createdAt: -1 });
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single book
exports.getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update stock (replace stock)
exports.updateStock = async (req, res) => {
  try {
    const { stock } = req.body;
    if (stock == null || isNaN(stock) || stock < 0) {
      return res.status(400).json({ message: "Invalid stock value" });
    }
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { stock },
      { new: true }
    );
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
