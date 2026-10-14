const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Product name is required"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Product description is required"],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, "Product price is required"],
    // min is inclusive (>= 0), but price must be strictly greater than 0
    validate: {
      validator: (value) => value > 0,
      message: "Price must be greater than 0",
    },
  },
  category: {
    type: String,
    required: [true, "Product category is required"],
    trim: true,
  },
  image: {
    type: String,
    required: [true, "Product image is required"],
    trim: true,
  },
  stock: {
    type: Number,
    required: [true, "Product stock is required"],
    min: [0, "Stock cannot be negative"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
