const express = require("express");
const router = express.Router();

const {
  createPaymentOrder,
  verifyPayment,
  getOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/order.controller");

const authMiddleware = require("../middlewares/auth.middleware");


// Every order route needs a logged-in customer
router.use(authMiddleware);

router.post("/create-payment-order", createPaymentOrder);
router.post("/verify-payment", verifyPayment);
router.get("/", getOrders);
router.get("/:id", getOrderById);

// Bonus: temporary development endpoint for status progression
router.patch("/:id/status", updateOrderStatus);

module.exports = router;
