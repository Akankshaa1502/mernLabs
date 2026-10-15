import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import useCurrentUser from "../hooks/useCurrentUser";
import useOrder from "../hooks/useOrder";
import { formatPrice } from "../utils/format";

function OrderSuccess() {
  const { id } = useParams();
  const { user, checking } = useCurrentUser();
  // Loaded from the backend, so this page also works after a refresh
  const { order, loading, error } = useOrder(id);

  if (checking) {
    return (
      <div className="loader-screen">
        <div className="spinner" />
        <p>Loading your account...</p>
      </div>
    );
  }

  if (!user) return null;

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
          <Link to="/orders" className="btn btn-primary">
            View My Orders
          </Link>
        </div>
      );
    }

    return (
      <section className="success-card">
        <p className="success-icon" aria-hidden="true">✅</p>
        <h1 className="success-title">Order Placed Successfully</h1>
        <p className="success-text">
          Your payment was verified and your order has been saved.
        </p>

        <dl className="success-details">
          <div className="detail-row">
            <dt>Order ID</dt>
            <dd className="mono">{order._id}</dd>
          </div>
          <div className="detail-row">
            <dt>Total</dt>
            <dd>{formatPrice(order.totalAmount)}</dd>
          </div>
          <div className="detail-row">
            <dt>Status</dt>
            <dd>{order.status}</dd>
          </div>
          <div className="detail-row">
            <dt>Payment</dt>
            <dd>{order.paymentStatus}</dd>
          </div>
        </dl>

        <div className="success-actions">
          <Link to="/orders" className="btn btn-primary">
            View My Orders
          </Link>
          <Link to="/products" className="btn btn-secondary">
            Continue Shopping
          </Link>
        </div>
      </section>
    );
  };

  return (
    <>
      <Navbar user={user} />
      <main className="products-page">{renderContent()}</main>
    </>
  );
}

export default OrderSuccess;
