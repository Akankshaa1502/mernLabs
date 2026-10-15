import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import OrderCard from "../components/OrderCard";
import useCurrentUser from "../hooks/useCurrentUser";
import { getOrders } from "../services/api";

function Orders() {
  const { user, checking } = useCurrentUser();

  // Bumping reloadKey re-runs the fetch (used by "Try Again")
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState({ key: null, orders: [], error: "" });
  const loading = result.key !== reloadKey;
  const { orders, error } = result;

  useEffect(() => {
    let ignore = false;

    getOrders()
      .then((res) => {
        if (!ignore) setResult({ key: reloadKey, orders: res.data.orders, error: "" });
      })
      .catch(() => {
        if (!ignore) {
          setResult({ key: reloadKey, orders: [], error: "Unable to load your orders." });
        }
      });

    return () => {
      ignore = true;
    };
  }, [reloadKey]);

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
          <p>Loading your orders...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="state-box state-error">
          <p>{error}</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setReloadKey((k) => k + 1)}
          >
            Try Again
          </button>
        </div>
      );
    }

    if (orders.length === 0) {
      return (
        <div className="state-box">
          <p className="state-icon" aria-hidden="true">📦</p>
          <p className="state-title">You have not placed any orders yet.</p>
          <Link to="/products" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      );
    }

    return (
      <div className="order-list">
        {orders.map((order) => (
          <OrderCard key={order._id} order={order} />
        ))}
      </div>
    );
  };

  return (
    <>
      <Navbar user={user} />
      <main className="products-page">
        <div className="page-header">
          <h1 className="page-title">My Orders</h1>
          {!loading && !error && orders.length > 0 && (
            <p className="page-subtitle">
              {orders.length} {orders.length === 1 ? "order" : "orders"}
            </p>
          )}
        </div>
        {renderContent()}
      </main>
    </>
  );
}

export default Orders;
