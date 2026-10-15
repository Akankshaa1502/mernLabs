import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import useCart from "../hooks/useCart";
import { loginCustomer, getErrorMessage } from "../services/api";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const justRegistered = location.state?.registered;
  const { refreshCart } = useCart();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const validationErrors = {};
    if (!form.email.trim()) validationErrors.email = "Email is required";
    if (!form.password) validationErrors.password = "Password is required";
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      // The server responds with a Set-Cookie header; the browser stores
      // the HttpOnly cookie automatically because of withCredentials.
      await loginCustomer({
        email: form.email.trim(),
        password: form.password,
      });
      // Load this customer's saved cart into the shared cart state
      refreshCart();
      navigate("/home", { replace: true });
    } catch (err) {
      setServerError(
        err.response?.status === 401 ? "Invalid Credentials" : getErrorMessage(err)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Login to continue to ShopKart</p>

          {justRegistered && !serverError && (
            <div className="alert alert-success">
              Account created successfully! Please login.
            </div>
          )}
          {serverError && <div className="alert alert-error">{serverError}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className={errors.email ? "input-error" : ""}
                autoComplete="email"
              />
              {errors.email && <p className="field-error">{errors.email}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                className={errors.password ? "input-error" : ""}
                autoComplete="current-password"
              />
              {errors.password && <p className="field-error">{errors.password}</p>}
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="auth-footer">
            New to ShopKart? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </main>
    </>
  );
}

export default Login;
