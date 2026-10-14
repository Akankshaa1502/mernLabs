const mongoose = require("mongoose");
const Product = require("../models/product.model");

// Fields the product listing UI actually needs (description, createdAt
// and __v are left out to keep the response small).
const LIST_FIELDS = "name price category image stock";

const SORT_OPTIONS = {
  price_asc: { price: 1 },
  price_desc: { price: -1 },
};

// Escape regex special characters so a search like "c++" or "(new)"
// is treated as plain text instead of breaking the regex.
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");


const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;


    if (!name || !description || !category || !image || price === undefined || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }


    if (typeof price !== "number" || price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a number greater than 0",
      });
    }


    if (typeof stock !== "number" || stock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock must be a number and cannot be negative",
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      image,
      stock,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (err) {
    // Schema validation failed (e.g. an empty string after trimming)
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: Object.values(err.errors)[0].message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err.message,
    });
  }
};


// GET /products?search=keyboard&category=Electronics&sort=price_asc
// The filter object is built step by step, so one endpoint handles
// every combination of query parameters.
const getProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;

    const filter = {};

    if (search && search.trim()) {
      // "i" option = case-insensitive, matches anywhere in the name
      filter.name = { $regex: escapeRegex(search.trim()), $options: "i" };
    }

    if (category && category.trim()) {
      filter.category = category.trim();
    }

    // Unknown or missing sort value falls back to newest first
    const sortBy = SORT_OPTIONS[sort] || { createdAt: -1 };

    const products = await Product.find(filter).select(LIST_FIELDS).sort(sortBy);

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err.message,
    });
  }
};


const getProductById = async (req, res) => {
  try {
    const { id } = req.params;


    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id).select("-__v");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
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
  createProduct,
  getProducts,
  getProductById,
};
