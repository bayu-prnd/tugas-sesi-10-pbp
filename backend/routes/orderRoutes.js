const express = require("express");
const router = express.Router();
const orderCtrl = require("../controllers/orderController");

router.get("/", orderCtrl.getOrders);
router.post("/", orderCtrl.createOrder);
router.put("/:id/confirm", orderCtrl.confirmOrder);

module.exports = router;
