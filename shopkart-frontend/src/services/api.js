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

// Pulls a readable message out of an axios error.
export const getErrorMessage = (err, fallback = "Something went wrong") => {
  if (!err.response) return "Unable to reach the server. Please try again.";
  return err.response.data?.message || fallback;
};

export default api;
