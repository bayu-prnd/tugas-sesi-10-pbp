from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

books = {}
orders = {}
book_id = 1
order_id = 1


# Models
class Book(BaseModel):
    title: str
    author: str
    stock: int


class Order(BaseModel):
    book_id: int
    quantity: int


# =============================
# 1. ADD BOOK
# =============================
@app.post("/books")
def add_book(data: Book):
    global book_id

    if data.stock <= 0:
        raise HTTPException(status_code=400, detail="Stok harus > 0")

    books[book_id] = {
        "id": book_id,
        "title": data.title,
        "author": data.author,
        "stock": data.stock,
    }
    book_id += 1
    return books[book_id - 1]


# =============================
# 2. GET ALL BOOKS
# =============================
@app.get("/books")
def get_books():
    return list(books.values())


# =============================
# 3. GET BOOK BY ID
# =============================
@app.get("/books/{id}")
def get_book(id: int):
    if id not in books:
        raise HTTPException(status_code=404, detail="Buku tidak ditemukan")
    return books[id]


# =============================
# 4. UPDATE STOCK
# =============================
@app.put("/books/{id}/stock")
def update_stock(id: int, data: Book):
    if id not in books:
        raise HTTPException(status_code=404, detail="Buku tidak ditemukan")

    if data.stock < 0:
        raise HTTPException(status_code=400, detail="Stok tidak boleh negatif")

    books[id]["stock"] = data.stock
    return books[id]


# =============================
# 5. CREATE ORDER
# =============================
@app.post("/orders")
def create_order(order: Order):
    global order_id

    if order.quantity <= 0:
        raise HTTPException(status_code=400, detail="Jumlah harus > 0")

    if order.book_id not in books:
        raise HTTPException(status_code=404, detail="Buku tidak ditemukan")

    orders[order_id] = {
        "id": order_id,
        "book_id": order.book_id,
        "quantity": order.quantity,
        "status": "pending",
    }
    order_id += 1
    return orders[order_id - 1]


# =============================
# 6. CONFIRM ORDER
# =============================
@app.post("/orders/{id}/confirm")
def confirm_order(id: int):
    if id not in orders:
        raise HTTPException(status_code=404, detail="Pesanan tidak ditemukan")

    order = orders[id]
    book = books[order["book_id"]]

    if book["stock"] < order["quantity"]:
        raise HTTPException(status_code=400, detail="Stok tidak cukup")

    # Update stok dan status
    book["stock"] -= order["quantity"]
    order["status"] = "confirmed"

    return order