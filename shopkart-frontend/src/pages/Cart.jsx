import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import CartItem from "../components/CartItem";
import useCart from "../hooks/useCart";
import useCurrentUser from "../hooks/useCurrentUser";
import { formatPrice } from "../utils/format";

function Cart() {
  const { user, checking } = useCurrentUser();
  const { cartItems, loading, error, itemCount, subtotal, refreshCart } = useCart();
  const [checkoutNote, setCheckoutNote] = useState("");

  // Re-load on every visit so the latest product price and stock are shown
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  if (checking) {
    return (
      <div className="loader-screen">
        <div className="spinner" />
        <p>Loading your account...</p>
      </div>
    );
  }

  if (!user) return null;

  // Any item asking for more units than are now in stock blocks checkout
  const hasStockProblem = cartItems.some((item) => item.quantity > item.product.stock);

  const renderContent = () => {
    // Keep showing the items during a background refresh; only show the
    // loader when there is nothing to show yet
    if (loading && cartItems.length === 0) {
      return (
        <div className="state-box">
          <div className="spinner" />
          <p>Loading your cart...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="state-box state-error">
          <p>{error}</p>
          <button type="button" className="btn btn-primary" onClick={refreshCart}>
            Try Again
          </button>
        </div>
      );
    }

    if (cartItems.length === 0) {
      return (
        <div className="state-box">
          <p className="state-icon" aria-hidden="true">🛒</p>
          <p className="state-title">Your cart is empty</p>
          <p>Looks like you haven't added anything yet.</p>
          <Link to="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      );
    }

    return (
      <div className="cart-layout">
        <section className="cart-list">
          {cartItems.map((item) => (
            <CartItem key={item.product._id} item={item} />
          ))}
          <Link to="/products" className="back-link continue-link">
            ← Continue shopping
          </Link>
        </section>

        <aside className="order-summary">
          <h2 className="summary-title">Order Summary</h2>
          <div className="summary-row">
            <span>Products</span>
            <span>{cartItems.length}</span>
          </div>
          <div className="summary-row">
            <span>Items</span>
            <span>{itemCount}</span>
          </div>
          <div className="summary-row summary-total">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          {/* Checkout flow is built in Lab 06 */}
          <button
            type="button"
            className="btn btn-primary btn-block"
            disabled={hasStockProblem}
            onClick={() => setCheckoutNote("Checkout will be available in the next update.")}
          >
            Proceed to Checkout
          </button>
          {hasStockProblem && (
            <p className="action-note action-note-error">
              Fix the stock issues above to continue.
            </p>
          )}
          {checkoutNote && <p className="action-note">{checkoutNote}</p>}
        </aside>
      </div>
    );
  };

  return (
    <>
      <Navbar user={user} />
      <main className="products-page">
        <div className="page-header">
          <h1 className="page-title">My Cart</h1>
        </div>
        {renderContent()}
      </main>
    </>
  );
}

export default Cart;
