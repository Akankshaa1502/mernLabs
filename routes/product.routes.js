const express = require("express");
const router = express.Router();

const {
  createProduct,
  getProducts,
  getProductById,
} = require("../controllers/product.controller");


// Open for now — admin-only protection comes in a later lab
router.post("/", createProduct);

router.get("/", getProducts);
router.get("/:id", getProductById);

module.exports = router;
