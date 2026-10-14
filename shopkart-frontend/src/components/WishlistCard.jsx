import { useState } from "react";
import { Link } from "react-router-dom";
import { removeFromWishlist } from "../services/api";
import { formatPrice, getStockStatus } from "../utils/format";

// onRemoved receives the wishlist ids the server sent back
function WishlistCard({ product, onRemoved }) {
  const stock = getStockStatus(product.stock);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState("");

  const handleRemove = async () => {
    if (removing) return;

    setRemoving(true);
    setError("");
    try {
      const res = await removeFromWishlist(product._id);
      onRemoved(product._id, res.data.wishlist);
    } catch (err) {
      // 404 = it was already removed (e.g. in another tab), so drop the card
      if (err.response?.status === 404) {
        onRemoved(product._id, null);
        return;
      }
      setError("Unable to remove product. Please try again.");
      setRemoving(false);
    }
  };

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
          loading="lazy"
        />
      </div>

      <div className="product-body">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-category">{product.category}</p>
        <p className="product-price">{formatPrice(product.price)}</p>
        <p className={`stock-badge stock-${stock.tone}`}>{stock.label}</p>

        <div className="card-actions">
          <Link to={`/products/${product._id}`} className="btn btn-primary btn-block">
            View Details
          </Link>
          <button
            type="button"
            className="btn btn-wishlist is-saved btn-block"
            onClick={handleRemove}
            disabled={removing}
          >
            {removing ? "⏳ Removing..." : "Remove ♥"}
          </button>
          {error && (
            <p className="action-note action-note-error" role="status">
              {error}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

export default WishlistCard;
