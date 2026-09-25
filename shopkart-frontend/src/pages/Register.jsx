import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { registerCustomer, getErrorMessage } from "../services/api";

const initialForm = { fullName: "", email: "", password: "", phone: "" };

const validate = ({ fullName, email, password, phone }) => {
  const errors = {};

  if (!fullName.trim()) errors.fullName = "Full name is required";
  else if (fullName.trim().length < 3)
    errors.fullName = "Full name must be at least 3 characters";

  if (!email.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = "Enter a valid email address";

  if (!password) errors.password = "Password is required";
  else if (password.length < 6)
    errors.password = "Password must be at least 6 characters";

  if (!phone.trim()) errors.phone = "Phone number is required";
  else if (!/^[0-9]{10}$/.test(phone))
    errors.phone = "Phone number must be exactly 10 digits";

  return errors;
};

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear a field's error as soon as the user edits it
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      await registerCustomer({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim(),
      });
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      setServerError(getErrorMessage(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Join ShopKart and start shopping</p>

          {serverError && <div className="alert alert-error">{serverError}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="John Doe"
                value={form.fullName}
                onChange={handleChange}
                className={errors.fullName ? "input-error" : ""}
                autoComplete="name"
              />
              {errors.fullName && <p className="field-error">{errors.fullName}</p>}
            </div>

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
                placeholder="At least 6 characters"
                value={form.password}
                onChange={handleChange}
                className={errors.password ? "input-error" : ""}
                autoComplete="new-password"
              />
              {errors.password && <p className="field-error">{errors.password}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="9876543210"
                value={form.phone}
                onChange={handleChange}
                className={errors.phone ? "input-error" : ""}
                autoComplete="tel"
                maxLength={10}
              />
              {errors.phone && <p className="field-error">{errors.phone}</p>}
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </main>
    </>
  );
}

export default Register;
