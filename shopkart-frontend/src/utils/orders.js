// Steps an order goes through after payment
export const ORDER_STEPS = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

// "6ad0083de4ce8bfb8819ef63" -> "#8819EF63"
export const shortOrderId = (id) => `#${id.slice(-8).toUpperCase()}`;

// "2026-10-05T10:00:00.000Z" -> "5 Oct 2026"
export const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
