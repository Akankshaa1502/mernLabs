import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import CheckoutForm from "../components/CheckoutForm";
import OrderSummary from "../components/OrderSummary";
import useCart from "../hooks/useCart";
import useCurrentUser from "../hooks/useCurrentUser";
import { createPaymentOrder, verifyPayment, getErrorMessage } from "../services/api";
import loadRazorpay from "../utils/loadRazorpay";
import { formatPrice } from "../utils/format";

const FORM_ID = "checkout-form";

// What the Place Order button says during each step
const STEP_LABELS = {
  creating: "Preparing payment...",
  paying: "Waiting for payment...",
  verifying: "Verifying payment...",
};

function Checkout() {
  const navigate = useNavigate();
  const { user, checking } = useCurrentUser();
  const { cartItems, loading, subtotal, refreshCart, clearCart } = useCart();

  // "idle" | "creating" | "paying" | "verifying"
  const [step, setStep] = useState("idle");
  const [error, setError] = useState("");
  const busyRef = useRef(false); // blocks double submits

  // Show the latest prices/stock in the summary
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const finish = (message = "") => {
    busyRef.current = false;
    setStep("idle");
    setError(message);
  };

  const handlePlaceOrder = async (shippingAddress) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setError("");
    setStep("creating");

    const scriptLoaded = await loadRazorpay();
    if (!scriptLoaded) {
      finish("Unable to load Razorpay. Check your internet connection and try again.");
      return;
    }

    // 1. Server validates the cart, stock and prices, creates a pending
    //    ShopKart order and a Razorpay order. Only the address is sent.
    let data;
    try {
      const res = await createPaymentOrder(shippingAddress);
      data = res.data;
    } catch (err) {
      // Stock/price may have changed: reload the cart so the summary is current
      if (err.response?.status === 400) refreshCart();
      finish(getErrorMessage(err, "Unable to place your order."));
      return;
    }

    // 2. Open Razorpay Checkout with the server-created order
    let paymentFailed = false;

    const razorpay = new window.Razorpay({
      key: data.key, // public Key ID only — the secret never leaves the server
      amount: data.amount,
      currency: data.currency,
      name: "ShopKart",
      description: "ShopKart Order",
      order_id: data.razorpayOrderId,
      prefill: {
        name: shippingAddress.fullName,
        contact: shippingAddress.phone,
        email: user.email,
      },
      theme: { color: "#2563eb" },

      // Called by Razorpay after a successful payment. This does NOT prove
      // the payment is real — we send the details to our backend, which
      // checks the signature before marking the order as paid.
      handler: async (response) => {
        setStep("verifying");
        try {
          const res = await verifyPayment({
            shopKartOrderId: data.shopKartOrderId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          busyRef.current = false;
          // Backend has cleared the saved cart; clear the shared state too
          // so the Navbar shows Cart (0) straight away.
          navigate(`/order-success/${res.data.order._id}`, { replace: true });
          clearCart();
        } catch (err) {
          finish(
            `${getErrorMessage(err, "We couldn't verify your payment.")}. ` +
              "Your order was not placed and your cart has not been cleared."
          );
        }
      },

      modal: {
        // User closed the Razorpay window without paying
        ondismiss: () => {
          if (!paymentFailed) {
            finish("Payment was cancelled. Your cart has not been cleared.");
          }
        },
      },
    });

    razorpay.on("payment.failed", (response) => {
      paymentFailed = true;
      finish(
        `Payment failed: ${response.error.description} ` +
          "Your cart has not been cleared. Please try again."
      );
    });

    setStep("paying");
    razorpay.open();
  };

  if (checking) {
    return (
      <div className="loader-screen">
        <div className="spinner" />
        <p>Loading your account...</p>
      </div>
    );
  }

  if (!user) return null;

  const busy = step !== "idle";
  const hasStockProblem = cartItems.some((item) => item.quantity > item.product.stock);

  const renderContent = () => {
    if (loading && cartItems.length === 0) {
      return (
        <div className="state-box">
          <div className="spinner" />
          <p>Loading your cart...</p>
        </div>
      );
    }

    // e.g. someone opens /checkout directly with an empty cart
    if (cartItems.length === 0) {
      return (
        <div className="state-box">
          <p className="state-icon" aria-hidden="true">🛒</p>
          <p className="state-title">Your cart is empty</p>
          <p>Add some products before checking out.</p>
          <Link to="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      );
    }

    return (
      <div className="cart-layout">
        <section className="checkout-card">
          <h2 className="summary-title">Shipping Details</h2>
          <CheckoutForm
            id={FORM_ID}
            initialValues={{ fullName: user.fullName, phone: user.phone }}
            onSubmit={handlePlaceOrder}
            disabled={busy}
          />
        </section>

        <aside className="order-summary">
          <OrderSummary
            items={cartItems.map(({ product, quantity }) => ({
              key: product._id,
              name: product.name,
              price: product.price,
              quantity,
            }))}
            total={subtotal}
          />

          {error && <div className="alert alert-error checkout-alert">{error}</div>}

          {hasStockProblem ? (
            <p className="action-note action-note-error">
              Some items exceed the available stock.{" "}
              <Link to="/cart">Update your cart</Link> to continue.
            </p>
          ) : (
            <button
              type="submit"
              form={FORM_ID}
              className="btn btn-primary btn-block"
              disabled={busy}
            >
              {STEP_LABELS[step] || `Pay ${formatPrice(subtotal)} with Razorpay`}
            </button>
          )}
          <p className="checkout-note">
            🔒 Test Mode — no real money is charged. The final amount is
            calculated by the server.
          </p>
        </aside>
      </div>
    );
  };

  return (
    <>
      <Navbar user={user} />
      <main className="products-page">
        <Link to="/cart" className="back-link">
          ← Back to cart
        </Link>
        <div className="page-header">
          <h1 className="page-title">Checkout</h1>
        </div>
        {renderContent()}
      </main>
    </>
  );
}

export default Checkout;
