import { formatPrice } from "../utils/format";

// items: [{ key, name, price, quantity }]
// Used on Checkout (live cart prices) and Order Details (saved snapshot).
function OrderSummary({ items, total, title = "Order Summary" }) {
  return (
    <div className="order-summary-box">
      <h2 className="summary-title">{title}</h2>
      <ul className="summary-items">
        {items.map((item) => (
          <li key={item.key} className="summary-item">
            <span className="summary-item-name">
              {item.name} × {item.quantity}
            </span>
            <span>{formatPrice(item.price * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className="summary-row summary-total">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>
    </div>
  );
}

export default OrderSummary;
