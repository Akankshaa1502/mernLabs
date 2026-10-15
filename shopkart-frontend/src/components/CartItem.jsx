import { useState } from "react";
import { Link } from "react-router-dom";
import useCart from "../hooks/useCart";
import { formatPrice } from "../utils/format";

function CartItem({ item }) {
  const { product, quantity } = item;
  const { updateQuantity, removeFromCart, isPending } = useCart();
  const [error, setError] = useState("");

  // Only THIS row is disabled while its request runs
  const busy = isPending(product._id);
  // Stock may have dropped after the item was added
  const overStock = quantity > product.stock;

  const run = async (action) => {
    if (busy) return;
    setError("");
    const result = await action();
    if (!result.success) setError(result.message);
  };

  const decrease = () => run(() => updateQuantity(product._id, quantity - 1));
  const increase = () => run(() => updateQuantity(product._id, quantity + 1));
  const remove = () => run(() => removeFromCart(product._id));

  return (
    <article className={`cart-item ${busy ? "is-busy" : ""}`}>
      <Link to={`/products/${product._id}`} className="cart-item-image-wrap">
        <img src={product.image} alt={product.name} className="cart-item-image" />
      </Link>

      <div className="cart-item-info">
        <Link to={`/products/${product._id}`} className="cart-item-name">
          {product.name}
        </Link>
        <p className="cart-item-price">{formatPrice(product.price)} each</p>

        <div className="qty-row">
          {/* At quantity 1, use Remove instead of going to 0 */}
          <div className="qty-control" aria-label={`Quantity of ${product.name}`}>
            <button
              type="button"
              className="qty-btn"
              onClick={decrease}
              disabled={busy || quantity <= 1}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="qty-value">{quantity}</span>
            <button
              type="button"
              className="qty-btn"
              onClick={increase}
              disabled={busy || quantity >= product.stock}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <button type="button" className="remove-btn" onClick={remove} disabled={busy}>
            Remove
          </button>
          {busy && <span className="action-note">Updating...</span>}
        </div>

        {overStock && (
          <p className="action-note action-note-error">
            {product.stock === 0 ? (
              "This product is now out of stock. Please remove it."
            ) : (
              <>
                Only {product.stock} left in stock.{" "}
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => run(() => updateQuantity(product._id, product.stock))}
                  disabled={busy}
                >
                  Set quantity to {product.stock}
                </button>
              </>
            )}
          </p>
        )}
        {error && (
          <p className="action-note action-note-error" role="status">
            {error}
          </p>
        )}
      </div>

      <p className="cart-item-total">{formatPrice(product.price * quantity)}</p>
    </article>
  );
}

export default CartItem;
