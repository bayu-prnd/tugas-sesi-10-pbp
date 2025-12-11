const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// Data buku sementara
let books = [];

// Tambah buku
app.post("/books", (req, res) => {
  const { title, stock } = req.body;

  if (!title || stock <= 0) {
    return res.status(400).json({ message: "Stok harus > 0 dan title wajib diisi" });
  }

  books.push({
    id: Date.now(),
    title,
    stock,
    status: "pending"
  });

  res.json({ message: "Buku ditambahkan", books });
});

// Cari buku
app.get("/books", (req, res) => {
  const q = req.query.q?.toLowerCase() || "";
  const result = books.filter(b => b.title.toLowerCase().includes(q));
  res.json(result);
});

// Update stok
app.put("/books/:id", (req, res) => {
  const { id } = req.params;
  const { stock } = req.body;

  if (stock <= 0) {
    return res.status(400).json({ message: "Stok harus > 0" });
  }

  const book = books.find(b => b.id == id);
  if (!book) return res.status(404).json({ message: "Buku tidak ditemukan" });

  book.stock = stock;
  res.json({ message: "Stok diperbarui", book });
});

// Konfirmasi pesanan
app.put("/books/confirm/:id", (req, res) => {
  const { id } = req.params;
  const book = books.find(b => b.id == id);
  if (!book) return res.status(404).json({ message: "Buku tidak ditemukan" });

  book.status = "confirmed";
  res.json({ message: "Pesanan dikonfirmasi", book });
});

app.listen(3000, () => console.log("Server running on port 3000"));
