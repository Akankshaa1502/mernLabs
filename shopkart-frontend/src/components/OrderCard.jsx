import { Link } from "react-router-dom";
import OrderStatus from "./OrderStatus";
import { formatPrice } from "../utils/format";
import { formatDate, shortOrderId } from "../utils/orders";

function OrderCard({ order }) {
  return (
    <article className="order-card">
      <div className="order-card-header">
        <div>
          <h2 className="order-card-title">Order {shortOrderId(order._id)}</h2>
          <p className="order-card-date">{formatDate(order.createdAt)}</p>
        </div>
        <p className="order-card-total">{formatPrice(order.totalAmount)}</p>
      </div>

      {/* Names and prices come from the order's snapshot, not the Product */}
      <ul className="order-card-items">
        {order.items.map((item) => (
          <li key={item.product}>
            {item.name} × {item.quantity}
          </li>
        ))}
      </ul>

      <OrderStatus status={order.status} compact />

      <Link to={`/orders/${order._id}`} className="btn btn-secondary order-card-btn">
        View Details
      </Link>
    </article>
  );
}

export default OrderCard;
