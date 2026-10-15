import { useContext } from "react";
import CartContext from "../context/CartContext";

// Gives any component access to the shared cart state and actions
function useCart() {
  const cart = useContext(CartContext);
  if (!cart) {
    throw new Error("useCart must be used inside <CartProvider>");
  }
  return cart;
}

export default useCart;
