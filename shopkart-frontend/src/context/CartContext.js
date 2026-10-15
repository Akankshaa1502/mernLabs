import { createContext } from "react";

// The one shared cart for the whole app. Filled by <CartProvider>,
// read with the useCart() hook.
const CartContext = createContext(null);

export default CartContext;
