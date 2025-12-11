const express = require("express");
const router = express.Router();
const bookCtrl = require("../controllers/bookController");

router.post("/", bookCtrl.createBook);
router.get("/", bookCtrl.getBooks);
router.get("/:id", bookCtrl.getBook);
router.put("/:id/stock", bookCtrl.updateStock);

module.exports = router;
