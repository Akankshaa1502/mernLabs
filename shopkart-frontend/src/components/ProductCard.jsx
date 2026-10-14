import { Link } from "react-router-dom";
import { formatPrice, getStockStatus } from "../utils/format";

function ProductCard({ product }) {
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
      </div>

      <div className="product-body">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-category">{product.category}</p>
        <p className="product-price">{formatPrice(product.price)}</p>
        <p className={`stock-badge stock-${stock.tone}`}>{stock.label}</p>

        <Link to={`/products/${product._id}`} className="btn btn-primary btn-block">
          View Details
        </Link>
      </div>
    </article>
  );
}

export default ProductCard;
