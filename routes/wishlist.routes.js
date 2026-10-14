const express = require("express");
const router = express.Router();

const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist,
} = require("../controllers/wishlist.controller");

const authMiddleware = require("../middlewares/auth.middleware");


// Every wishlist route needs a logged-in customer
router.use(authMiddleware);

// No /wishlist/:userId route on purpose: the user comes from the JWT
router.get("/", getWishlist);
router.post("/:productId", addToWishlist);
router.delete("/:productId", removeFromWishlist);
router.patch("/:productId/toggle", toggleWishlist);

module.exports = router;
