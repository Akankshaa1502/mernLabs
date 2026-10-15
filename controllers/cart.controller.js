const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

// Fields the cart UI needs from each populated product
const CART_FIELDS = "name price category image stock";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const stockMessage = (stock) =>
  stock === 0
    ? "This product is out of stock"
    : `Only ${stock} ${stock === 1 ? "unit" : "units"} available`;

// Loads the logged-in customer's cart (only the cart field)
const findCustomerCart = (customerId) =>
  Customer.findById(customerId).select("cart");

// Fills in product details for every cart item and returns the array.
// Items whose product was deleted from the catalogue are dropped.
const populateCart = async (customer) => {
  await customer.populate({ path: "cart.product", select: CART_FIELDS });
  return customer.cart.filter((item) => item.product);
};

const findItem = (customer, productId) =>
  customer.cart.find((item) => item.product.equals(productId));

// As with the wishlist, the user always comes from the JWT (req.user),
// never from the request body.


// POST /cart/:productId
// New product -> quantity 1. Already in cart -> quantity + 1.
const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!isValidId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(productId).select("stock");
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const customer = await findCustomerCart(req.user._id);
    const item = findItem(customer, productId);
    const newQuantity = item ? item.quantity + 1 : 1;

    // Business rule: never allow more units than the latest stock
    if (newQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: stockMessage(product.stock),
      });
    }

    // One row per product: increase the existing row instead of adding a
    // duplicate one
    if (item) {
      item.quantity = newQuantity;
    } else {
      customer.cart.push({ product: productId, quantity: 1 });
    }

    await customer.save();

    res.status(200).json({
      success: true,
      message: "Cart updated",
      cart: await populateCart(customer),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err.message,
    });
  }
};


// GET /cart
const getCart = async (req, res) => {
  try {
    const customer = await findCustomerCart(req.user._id);

    res.status(200).json({
      success: true,
      cart: await populateCart(customer),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err.message,
    });
  }
};


// PATCH /cart/:productId   body: { "quantity": 3 }
const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!isValidId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    if (typeof quantity !== "number" || !Number.isInteger(quantity)) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a whole number",
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const product = await Product.findById(productId).select("stock");
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const customer = await findCustomerCart(req.user._id);
    const item = findItem(customer, productId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Product is not in your cart",
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: stockMessage(product.stock),
      });
    }

    item.quantity = quantity;
    await customer.save();

    res.status(200).json({
      success: true,
      message: "Cart updated",
      cart: await populateCart(customer),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err.message,
    });
  }
};


// DELETE /cart/:productId
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!isValidId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const customer = await findCustomerCart(req.user._id);
    if (!findItem(customer, productId)) {
      return res.status(404).json({
        success: false,
        message: "Product is not in your cart",
      });
    }

    customer.cart = customer.cart.filter((item) => !item.product.equals(productId));
    await customer.save();

    res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart: await populateCart(customer),
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
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
};
