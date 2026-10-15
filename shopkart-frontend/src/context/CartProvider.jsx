import { useCallback, useEffect, useMemo, useState } from "react";
import CartContext from "./CartContext";
import {
  getCart,
  addToCart as addToCartApi,
  updateCartQuantity,
  removeFromCart as removeFromCartApi,
  getErrorMessage,
} from "../services/api";

// Holds the cart for the whole app, so the Navbar, product cards and
// Cart page all read the SAME data instead of fetching their own copies.
//
// The backend (MongoDB) is the real source of truth. After every change
// we replace cartItems with the cart the server sends back, so the UI
// can never drift away from what is saved.
function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Product ids that have a request running (per-item loading state)
  const [pendingIds, setPendingIds] = useState([]);

  const handleLoaded = useCallback((res) => {
    setCartItems(res.data.cart);
    setError("");
    setLoading(false);
  }, []);

  const handleLoadFailed = useCallback((err) => {
    // 401 just means nobody is logged in yet: an empty cart, not an error
    if (err.response?.status === 401) setCartItems([]);
    else setError("Unable to load your cart.");
    setLoading(false);
  }, []);

  // Load the cart once when the app starts (e.g. after a page refresh)
  useEffect(() => {
    getCart().then(handleLoaded, handleLoadFailed);
  }, [handleLoaded, handleLoadFailed]);

  // Re-fetch from the backend (after login, on the Cart page, "Try Again")
  const refreshCart = useCallback(() => {
    setLoading(true);
    setError("");
    return getCart().then(handleLoaded, handleLoadFailed);
  }, [handleLoaded, handleLoadFailed]);

  // Used on logout so the next user never sees the previous cart
  const clearCart = useCallback(() => {
    setCartItems([]);
    setError("");
  }, []);

  // Runs one cart API call for a product and stores the returned cart.
  // Returns { success } or { success: false, message } for the UI to show.
  const runMutation = useCallback(async (productId, request) => {
    setPendingIds((ids) => [...ids, productId]);
    try {
      const res = await request();
      setCartItems(res.data.cart);
      return { success: true };
    } catch (err) {
      const status = err.response?.status;

      // 400/404 usually mean stock or the cart changed on the server
      // (e.g. another tab). Re-sync so the UI shows the real state.
      if (status === 400 || status === 404) {
        getCart()
          .then((res) => setCartItems(res.data.cart))
          .catch(() => {});
      }

      const message =
        status === 401
          ? "Your session has expired. Please log in again."
          : getErrorMessage(err, "Unable to update your cart.");
      return { success: false, message };
    } finally {
      setPendingIds((ids) => ids.filter((id) => id !== productId));
    }
  }, []);

  const addToCart = useCallback(
    (productId) => runMutation(productId, () => addToCartApi(productId)),
    [runMutation]
  );

  const updateQuantity = useCallback(
    (productId, quantity) =>
      runMutation(productId, () => updateCartQuantity(productId, quantity)),
    [runMutation]
  );

  const removeFromCart = useCallback(
    (productId) => runMutation(productId, () => removeFromCartApi(productId)),
    [runMutation]
  );

  const value = useMemo(() => {
    // Derived values: calculated from cartItems on every change, never
    // stored separately (so they can't go stale)
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    return {
      cartItems,
      loading,
      error,
      itemCount,
      subtotal,
      refreshCart,
      clearCart,
      addToCart,
      updateQuantity,
      removeFromCart,
      isPending: (productId) => pendingIds.includes(productId),
      getQuantity: (productId) =>
        cartItems.find((item) => item.product._id === productId)?.quantity || 0,
    };
  }, [
    cartItems,
    loading,
    error,
    pendingIds,
    refreshCart,
    clearCart,
    addToCart,
    updateQuantity,
    removeFromCart,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export default CartProvider;
