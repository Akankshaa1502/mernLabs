import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import OrderStatus from "../components/OrderStatus";
import useCurrentUser from "../hooks/useCurrentUser";
import useOrder from "../hooks/useOrder";
import { updateOrderStatus, getErrorMessage } from "../services/api";
import { formatPrice } from "../utils/format";
import { ORDER_STEPS, formatDate, shortOrderId } from "../utils/orders";

function OrderDetails() {
  const { id } = useParams();
  const { user, checking } = useCurrentUser();
  const { order, loading, error, reload, setOrder } = useOrder(id);
  const [updating, setUpdating] = useState(false);
  const [statusError, setStatusError] = useState("");

  if (checking) {
    return (
      <div className="loader-screen">
        <div className="spinner" />
        <p>Loading your account...</p>
      </div>
    );
  }

  if (!user) return null;

  // Bonus: dev-only button to move the order to the next status
  const advanceStatus = async (nextStatus) => {
    setUpdating(true);
    setStatusError("");
    try {
      const res = await updateOrderStatus(order._id, nextStatus);
      setOrder(res.data.order);
    } catch (err) {
      setStatusError(getErrorMessage(err, "Unable to update status."));
    } finally {
      setUpdating(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="state-box">
          <div className="spinner" />
          <p>Loading your order...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="state-box state-error">
          <p>{error}</p>
          <div className="success-actions">
            <button type="button" className="btn btn-primary" onClick={reload}>
              Try Again
            </button>
            <Link to="/orders" className="btn btn-secondary">
              Back to orders
            </Link>
          </div>
        </div>
      );
    }

    const { shippingAddress: address } = order;
    const nextStatus = ORDER_STEPS[ORDER_STEPS.indexOf(order.status) + 1];

    return (
      <div className="order-details">
        <section className="checkout-card">
          <div className="order-card-header">
            <div>
              <h1 className="page-title">Order {shortOrderId(order._id)}</h1>
              <p className="order-card-date">Placed on {formatDate(order.createdAt)}</p>
            </div>
            <span className={`status-badge ${order.paymentStatus === "PAID" ? "status-paid" : "status-pending"}`}>
              {order.paymentStatus}
            </span>
          </div>

          <OrderStatus status={order.status} />

          {import.meta.env.DEV && nextStatus && order.paymentStatus === "PAID" && (
            <div className="dev-tools">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => advanceStatus(nextStatus)}
                disabled={updating}
              >
                {updating ? "Updating..." : `Dev: mark as ${nextStatus}`}
              </button>
              {statusError && <p className="action-note action-note-error">{statusError}</p>}
            </div>
          )}
        </section>

        <section className="checkout-card">
          <h2 className="summary-title">Items</h2>
          {/* Snapshot: name/price as they were when the order was paid */}
          <ul className="order-items">
            {order.items.map((item) => (
              <li key={item.product} className="order-item">
                <div className="cart-item-image-wrap">
                  {item.image && <img src={item.image} alt={item.name} className="cart-item-image" />}
                </div>
                <div className="cart-item-info">
                  <Link to={`/products/${item.product}`} className="cart-item-name">
                    {item.name}
                  </Link>
                  <p className="cart-item-price">
                    {formatPrice(item.price)} × {item.quantity}
                  </p>
                </div>
                <p className="cart-item-total">{formatPrice(item.price * item.quantity)}</p>
              </li>
            ))}
          </ul>
          <div className="summary-row summary-total">
            <span>Total paid</span>
            <span>{formatPrice(order.totalAmount)}</span>
          </div>
        </section>

        <section className="checkout-card">
          <h2 className="summary-title">Shipping & Payment</h2>
          <dl className="profile-details">
            <div className="detail-row">
              <dt>Deliver to</dt>
              <dd>
                {address.fullName}
                <br />
                {address.addressLine1}, {address.city}, {address.state} – {address.pincode}
                <br />
                {address.phone}
              </dd>
            </div>
            {order.razorpayPaymentId && (
              <div className="detail-row">
                <dt>Payment ID</dt>
                <dd className="mono">{order.razorpayPaymentId}</dd>
              </div>
            )}
          </dl>
        </section>
      </div>
    );
  };

  return (
    <>
      <Navbar user={user} />
      <main className="products-page">
        <Link to="/orders" className="back-link">
          ← Back to orders
        </Link>
        {renderContent()}
      </main>
    </>
  );
}

export default OrderDetails;
