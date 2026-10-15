import { useState } from "react";
import { Link } from "react-router-dom";
import useCart from "../hooks/useCart";

function AddToCartButton({ product, className = "" }) {
  const { addToCart, isPending, getQuantity } = useCart();
  const [note, setNote] = useState(null); // { type: "success" | "error", text }

  const adding = isPending(product._id);
  const inCart = getQuantity(product._id);
  const outOfStock = product.stock === 0;
  // Can't add more units than are in stock
  const atLimit = !outOfStock && inCart >= product.stock;

  const handleClick = async () => {
    if (adding) return; // ignore extra clicks while a request is running

    setNote(null);
    const result = await addToCart(product._id);
    setNote(
      result.success
        ? { type: "success", text: "✓ Added to cart" }
        : { type: "error", text: result.message }
    );
  };

  let label = inCart > 0 ? "Add Another" : "Add to Cart";
  if (outOfStock) label = "Out of Stock";
  else if (atLimit) label = "Max quantity in cart";
  if (adding) label = "Adding...";

  return (
    <div className="cart-action">
      <button
        type="button"
        className={`btn btn-primary ${className}`}
        onClick={handleClick}
        disabled={adding || outOfStock || atLimit}
      >
        {label}
      </button>
      {inCart > 0 && (
        <p className="action-note">
          {inCart} in your <Link to="/cart">cart</Link>
        </p>
      )}
      {note && (
        <p className={`action-note action-note-${note.type}`} role="status">
          {note.text}
        </p>
      )}
    </div>
  );
}

export default AddToCartButton;
