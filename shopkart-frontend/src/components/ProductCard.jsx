import { Link } from "react-router-dom";
import AddToCartButton from "./AddToCartButton";
import WishlistButton from "./WishlistButton";
import { formatPrice, getStockStatus } from "../utils/format";

function ProductCard({ product, saved, onWishlistChange }) {
  const stock = getStockStatus(product.stock);

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
          loading="lazy"
        />
        <span
          className={`heart-badge ${saved ? "is-saved" : ""}`}
          title={saved ? "In your wishlist" : "Not in your wishlist"}
          aria-hidden="true"
        >
          {saved ? "♥" : "♡"}
        </span>
      </div>

      <div className="product-body">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-category">{product.category}</p>
        <p className="product-price">{formatPrice(product.price)}</p>
        <p className={`stock-badge stock-${stock.tone}`}>{stock.label}</p>

        <div className="card-actions">
          <AddToCartButton product={product} className="btn-block" />
          <Link to={`/products/${product._id}`} className="btn btn-secondary btn-block">
            View Details
          </Link>
          <WishlistButton
            productId={product._id}
            saved={saved}
            onChange={onWishlistChange}
            className="btn-block"
          />
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
