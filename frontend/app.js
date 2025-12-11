const API = "/api";

// Utils
async function request(path, opts = {}) {
  const res = await fetch(path, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || res.statusText);
  }
  return res.json();
}

// Books
async function loadBooks(q = "") {
  const url = q ? `${API}/books?q=${encodeURIComponent(q)}` : `${API}/books`;
  const books = await request(url);
  const tbody = document.querySelector("#booksTable tbody");
  tbody.innerHTML = books.map(b => `
    <tr>
      <td>${escapeHtml(b.title)}</td>
      <td>${escapeHtml(b.author || "")}</td>
      <td>${b.stock}</td>
      <td>
        <button class="btn btn-sm btn-warning" onclick="promptStock('${b._id}', ${b.stock})">Update Stok</button>
      </td>
    </tr>
  `).join("");

  // fill select for orders
  const sel = document.getElementById("selectBook");
  sel.innerHTML = books.map(b => `<option value="${b._id}">${escapeHtml(b.title)} (stok: ${b.stock})</option>`).join("");
  return books;
}

async function createBook() {
  const title = document.getElementById("title").value.trim();
  const author = document.getElementById("author").value.trim();
  const stock = Number(document.getElementById("stock").value || 0);
  if (!title) return alert("Judul wajib diisi");
  try {
    await request(`${API}/books`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, author, stock })
    });
    document.getElementById("title").value = "";
    document.getElementById("author").value = "";
    document.getElementById("stock").value = "";
    await loadBooks();
  } catch (err) { alert(err.message); }
}

async function promptStock(id, current) {
  const val = prompt("Masukkan stok baru:", current);
  if (val == null) return;
  const stock = Number(val);
  if (isNaN(stock) || stock < 0) return alert("Stok tidak valid");
  try {
    await request(`${API}/books/${id}/stock`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock })
    });
    await loadBooks();
    await loadOrders();
  } catch (err) { alert(err.message); }
}

// Orders
async function loadOrders() {
  const orders = await request(`${API}/orders`);
  const tbody = document.querySelector("#ordersTable tbody");
  tbody.innerHTML = orders.map(o => `
    <tr>
      <td>${o._id}</td>
      <td>${escapeHtml(o.bookId?.title || o.bookId)}</td>
      <td>${o.qty}</td>
      <td>${o.status}</td>
      <td>
        ${o.status === "pending" ? `<button class="btn btn-sm btn-success" onclick="confirmOrder('${o._id}')">Konfirmasi</button>` : "-"}
      </td>
    </tr>
  `).join("");
}

async function createOrder() {
  const bookId = document.getElementById("selectBook").value;
  const qty = Number(document.getElementById("orderQty").value);
  if (!bookId) return alert("Pilih buku");
  if (!qty || qty <= 0) return alert("Qty harus > 0");
  try {
    await request(`${API}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId, qty })
    });
    document.getElementById("orderQty").value = "";
    await loadOrders();
  } catch (err) { alert(err.message); }
}

async function confirmOrder(id) {
  if (!confirm("Konfirmasi pesanan ini?")) return;
  try {
    await request(`${API}/orders/${id}/confirm`, { method: "PUT" });
    await loadBooks();
    await loadOrders();
  } catch (err) { alert(err.message); }
}

// helpers
function escapeHtml(text = "") {
  return text.replace(/[&<>"']/g, (m) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));
}

// events
document.getElementById("btnAdd").addEventListener("click", createBook);
document.getElementById("btnOrder").addEventListener("click", createOrder);
document.getElementById("btnSearch").addEventListener("click", () => {
  const q = document.getElementById("search").value.trim();
  loadBooks(q);
});
document.getElementById("btnReload").addEventListener("click", () => { document.getElementById("search").value = ""; loadBooks(); });

// initial load
loadBooks();
loadOrders();
