const crypto = require("crypto");
const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const { getRazorpay, isRazorpayConfigured } = require("../config/razorpay");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const ADDRESS_FIELDS = ["fullName", "phone", "addressLine1", "city", "state", "pincode"];

// Order status steps after payment (bonus: status progression)
const STATUS_FLOW = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

// Returns { address } with trimmed values, or { error } with a message.
const validateShippingAddress = (input) => {
  if (!input || typeof input !== "object") {
    return { error: "Shipping address is required" };
  }

  const address = {};
  for (const field of ADDRESS_FIELDS) {
    const value = typeof input[field] === "string" ? input[field].trim() : "";
    // Whitespace-only counts as empty
    if (!value) return { error: "All shipping address fields are required" };
    address[field] = value;
  }

  if (!/^[0-9]{10}$/.test(address.phone)) {
    return { error: "Phone number must be exactly 10 digits" };
  }
  if (!/^[0-9]{6}$/.test(address.pincode)) {
    return { error: "Pincode must contain 6 digits" };
  }

  return { address };
};


// POST /orders/create-payment-order   body: { shippingAddress }
// Anything else in the body (totalAmount, items, prices...) is ignored:
// the server builds the order from the user's saved cart and the LATEST
// product data.
const createPaymentOrder = async (req, res) => {
  try {
    const { address, error } = validateShippingAddress(req.body.shippingAddress);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    // 1. Load the authenticated user's cart with the latest product data
    const customer = await Customer.findById(req.user._id)
      .select("cart")
      .populate({ path: "cart.product", select: "name price image stock" });

    if (customer.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    // 2. Re-check every item: product still exists, enough stock
    const items = [];
    let totalAmount = 0;

    for (const { product, quantity } of customer.cart) {
      if (!product) {
        return res.status(400).json({
          success: false,
          message: "A product in your cart is no longer available. Please review your cart.",
        });
      }

      if (quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}.`,
        });
      }

      // 3. Snapshot purchase-time data and calculate the total on the server
      items.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.image,
      });
      totalAmount += product.price * quantity;
    }

    if (!isRazorpayConfigured()) {
      return res.status(500).json({
        success: false,
        message: "Payments are not configured on the server",
      });
    }

    // 4. Save a pending ShopKart order (the cart is NOT touched yet)
    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress: address,
      totalAmount,
    });

    // 5. Create the Razorpay order. Amount is in paise (₹1 = 100 paise).
    let razorpayOrder;
    try {
      razorpayOrder = await getRazorpay().orders.create({
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        receipt: order._id.toString(),
      });
    } catch (err) {
      order.paymentStatus = "FAILED";
      await order.save();
      return res.status(502).json({
        success: false,
        message: "Unable to start the payment. Please try again.",
        error: err.error?.description || err.message,
      });
    }

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    // 6. Only safe data goes back: the Key ID is public, the Secret is not
    res.status(201).json({
      success: true,
      shopKartOrderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err.message,
    });
  }
};


// POST /orders/verify-payment
// body: { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
const verifyPayment = async (req, res) => {
  try {
    const {
      shopKartOrderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!isValidId(shopKartOrderId) || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment details",
      });
    }

    // The order must belong to the logged-in user
    const order = await Order.findOne({ _id: shopKartOrderId, user: req.user._id });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Already verified (e.g. the request was sent twice)
    if (order.paymentStatus === "PAID") {
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        order,
      });
    }

    // The browser's order id must match the one we saved
    if (!order.razorpayOrderId || (razorpay_order_id && razorpay_order_id !== order.razorpayOrderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // Razorpay signs "<order_id>|<payment_id>" with our Key Secret.
    // We rebuild that signature using the order id stored in OUR database.
    // Only Razorpay and this server know the secret, so a matching
    // signature proves the payment really happened for this order.
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${order.razorpayOrderId}|${razorpay_payment_id}`)
      .digest("hex");

    const expected = Buffer.from(expectedSignature);
    const received = Buffer.from(String(razorpay_signature));
    const isValid =
      expected.length === received.length && crypto.timingSafeEqual(expected, received);

    if (!isValid) {
      // Order stays PENDING and the cart is NOT cleared
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // Payment is genuine: confirm the order
    order.paymentStatus = "PAID";
    order.status = "PLACED";
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // Reduce stock for the purchased units
    await Product.bulkWrite(
      order.items.map((item) => ({
        updateOne: {
          filter: { _id: item.product, stock: { $gte: item.quantity } },
          update: { $inc: { stock: -item.quantity } },
        },
      }))
    );

    // Only now is the cart cleared
    await Customer.updateOne({ _id: req.user._id }, { $set: { cart: [] } });

    res.status(200).json({
      success: true,
      message: "Payment verified. Order placed.",
      order,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err.message,
    });
  }
};


// GET /orders — current user's orders, newest first.
// Unpaid checkout attempts (PENDING_PAYMENT) are not real orders, so they
// are left out of the history.
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
      status: { $ne: "PENDING_PAYMENT" },
    })
      .select("-__v")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err.message,
    });
  }
};


// GET /orders/:id
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // Filtering by user means another customer's order is simply "not
    // found" — guessing an id reveals nothing.
    const order = await Order.findOne({ _id: id, user: req.user._id }).select("-__v");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err.message,
    });
  }
};


// PATCH /orders/:id/status   body: { status }   (bonus)
// Temporary development endpoint: moves a paid order one step forward
// (PLACED -> CONFIRMED -> SHIPPED -> DELIVERED). In a real app only an
// admin could do this; admin roles are not part of these labs.
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findOne({ _id: id, user: req.user._id });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const currentStep = STATUS_FLOW.indexOf(order.status);
    if (order.paymentStatus !== "PAID" || currentStep === -1) {
      return res.status(400).json({
        success: false,
        message: "Only paid orders can change status",
      });
    }

    if (STATUS_FLOW.indexOf(status) !== currentStep + 1) {
      return res.status(400).json({
        success: false,
        message:
          currentStep === STATUS_FLOW.length - 1
            ? "Order is already delivered"
            : `Next status must be ${STATUS_FLOW[currentStep + 1]}`,
      });
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: `Order marked as ${status}`,
      order,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err.message,
    });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getOrders,
  getOrderById,
  updateOrderStatus,
};
