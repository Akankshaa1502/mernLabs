// 2999 -> "₹2,999"
export const formatPrice = (price) =>
  price.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

// Returns the label and a CSS modifier for the stock badge
export const getStockStatus = (stock) => {
  if (stock === 0) return { label: "Out of stock", tone: "out" };
  const label = `${stock} ${stock === 1 ? "unit" : "units"} left`;
  return { label, tone: stock <= 5 ? "low" : "in" };
};
