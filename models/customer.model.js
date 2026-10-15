const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  // Only Product ObjectIds are stored, not copies of the products, so the
  // Product collection stays the single source of truth for price/stock.
  // Existing customers without this field get [] automatically.
  wishlist: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    default: [],
  },
  // A cart item needs one more thing than a wishlist entry: quantity.
  // Price is NOT stored here — it is read from the Product (via populate)
  // so the cart always shows the latest price. Subtotal is calculated on
  // the frontend, never stored.
  cart: {
    type: [
      {
        _id: false,
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
          min: [1, "Quantity must be at least 1"],
        },
      },
    ],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;