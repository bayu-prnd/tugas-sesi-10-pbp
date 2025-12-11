from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

FASTAPI_URL = "http://127.0.0.1:8000"


# ============================
# 1. GET ALL BOOKS (FastAPI)
# ============================
@app.route("/books", methods=["GET"])
def get_books():
    r = requests.get(f"{FASTAPI_URL}/books")
    return jsonify(r.json()), r.status_code


# ============================
# 2. ADD BOOK
# ============================
@app.route("/books", methods=["POST"])
def add_book():
    data = request.json
    r = requests.post(f"{FASTAPI_URL}/books", json=data)
    return jsonify(r.json()), r.status_code


# ============================
# 3. UPDATE STOCK
# ============================
@app.route("/books/<int:id>/stock", methods=["PUT"])
def update_stock(id):
    data = request.json
    r = requests.put(f"{FASTAPI_URL}/books/{id}/stock", json=data)
    return jsonify(r.json()), r.status_code


# ============================
# 4. CREATE ORDER
# ============================
@app.route("/orders", methods=["POST"])
def create_order():
    data = request.json
    r = requests.post(f"{FASTAPI_URL}/orders", json=data)
    return jsonify(r.json()), r.status_code


# ============================
# 5. CONFIRM ORDER
# ============================
@app.route("/orders/<int:id>/confirm", methods=["POST"])
def confirm_order(id):
    r = requests.post(f"{FASTAPI_URL}/orders/{id}/confirm")
    return jsonify(r.json()), r.status_code


if __name__ == "__main__":
    app.run(port=5000, debug=True)