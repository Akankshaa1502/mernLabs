import { ORDER_STEPS } from "../utils/orders";

// Visual tracker: PLACED → CONFIRMED → SHIPPED → DELIVERED
function OrderStatus({ status, compact = false }) {
  const current = ORDER_STEPS.indexOf(status);

  if (current === -1) {
    return <span className="status-badge status-pending">{status.replace("_", " ")}</span>;
  }

  return (
    <ol className={`status-tracker ${compact ? "is-compact" : ""}`} aria-label={`Order status: ${status}`}>
      {ORDER_STEPS.map((step, index) => (
        <li
          key={step}
          className={`status-step ${index <= current ? "is-done" : ""} ${index === current ? "is-current" : ""}`}
          aria-current={index === current ? "step" : undefined}
        >
          <span className="status-dot" aria-hidden="true">
            {index <= current ? "✓" : index + 1}
          </span>
          <span className="status-label">{step}</span>
        </li>
      ))}
    </ol>
  );
}

export default OrderStatus;
