const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

// Fields the wishlist cards need from each populated product
const WISHLIST_FIELDS = "name price category image stock";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// The user always comes from the JWT (req.user, set by authMiddleware),
// never from the request body or URL, so a customer can only ever touch
// their own wishlist.


// POST /wishlist/:productId
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!isValidId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(productId).select("_id");
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Duplicate prevention in one database operation: the filter only
    // matches if the product is NOT already in the wishlist ($ne), so a
    // second request (even a double click) cannot push it twice.
    const customer = await Customer.findOneAndUpdate(
      { _id: req.user._id, wishlist: { $ne: productId } },
      { $push: { wishlist: productId } },
      { returnDocument: "after" }
    ).select("wishlist");

    if (!customer) {
      return res.status(409).json({
        success: false,
        message: "Product is already in your wishlist",
      });
    }

    res.status(201).json({
      success: true,
      message: "Product added to wishlist",
      wishlist: customer.wishlist,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err.message,
    });
  }
};


// GET /wishlist
const getWishlist = async (req, res) => {
  try {
    // populate() replaces each stored ObjectId with the matching Product
    // document, so the UI always gets the latest price and stock.
    const customer = await Customer.findById(req.user._id)
      .select("wishlist")
      .populate({ path: "wishlist", select: WISHLIST_FIELDS });

    // Products deleted from the catalogue are dropped by populate()
    const wishlist = customer.wishlist;

    res.status(200).json({
      success: true,
      count: wishlist.length,
      wishlist,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err.message,
    });
  }
};


// DELETE /wishlist/:productId
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!isValidId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Only matches if the product IS in the wishlist; otherwise null -> 404
    const customer = await Customer.findOneAndUpdate(
      { _id: req.user._id, wishlist: productId },
      { $pull: { wishlist: productId } },
      { returnDocument: "after" }
    ).select("wishlist");

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Product is not in your wishlist",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
      wishlist: customer.wishlist,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err.message,
    });
  }
};


// PATCH /wishlist/:productId/toggle  (bonus)
// Removes the product if it is saved, otherwise adds it.
const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!isValidId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Try removing first; if it was there, we're done
    const removed = await Customer.findOneAndUpdate(
      { _id: req.user._id, wishlist: productId },
      { $pull: { wishlist: productId } },
      { returnDocument: "after" }
    ).select("wishlist");

    if (removed) {
      return res.status(200).json({
        success: true,
        saved: false,
        message: "Product removed from wishlist",
        wishlist: removed.wishlist,
      });
    }

    const product = await Product.findById(productId).select("_id");
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // $addToSet only adds the id if it isn't already in the array
    const added = await Customer.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { wishlist: productId } },
      { returnDocument: "after" }
    ).select("wishlist");

    res.status(200).json({
      success: true,
      saved: true,
      message: "Product added to wishlist",
      wishlist: added.wishlist,
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
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist,
};
