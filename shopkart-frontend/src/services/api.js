import axios from "axios";

// withCredentials: true makes the browser attach (and accept) the HttpOnly
// auth cookie on every request to the backend.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export const registerCustomer = (data) => api.post("/customers/register", data);

export const loginCustomer = (credentials) =>
  api.post("/customers/login", credentials);

export const getCurrentCustomer = () => api.get("/customers/me");

export const logoutCustomer = () => api.post("/customers/logout");

// filters = { search, category, sort }. Empty values are dropped so the
// URL stays clean, e.g. /products?search=phone&category=Electronics
export const getProducts = (filters = {}) => {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value)
  );
  return api.get("/products", { params });
};

export const getProductById = (id) => api.get(`/products/${id}`);

// Wishlist: no user id is ever sent — the server reads it from the cookie
export const getWishlist = () => api.get("/wishlist");

export const addToWishlist = (productId) => api.post(`/wishlist/${productId}`);

export const removeFromWishlist = (productId) =>
  api.delete(`/wishlist/${productId}`);

// Cart: every call returns the full, updated cart from the server
export const getCart = () => api.get("/cart");

export const addToCart = (productId) => api.post(`/cart/${productId}`);

export const updateCartQuantity = (productId, quantity) =>
  api.patch(`/cart/${productId}`, { quantity });

export const removeFromCart = (productId) => api.delete(`/cart/${productId}`);

// Pulls a readable message out of an axios error.
export const getErrorMessage = (err, fallback = "Something went wrong") => {
  if (!err.response) return "Unable to reach the server. Please try again.";
  return err.response.data?.message || fallback;
};

export default api;
