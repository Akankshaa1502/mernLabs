import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import useCart from "../hooks/useCart";
import { logoutCustomer } from "../services/api";

function Navbar({ user }) {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  // Read from the shared cart state — the Navbar never fetches the cart
  const { itemCount, clearCart } = useCart();

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutCustomer(); // server clears the HttpOnly cookie
    } catch {
      // Even if the request fails (e.g. session already expired),
      // the user should still end up on the login page.
    } finally {
      clearCart();
      navigate("/login", { replace: true });
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to={user ? "/home" : "/login"} className="brand">
          <span className="brand-mark">S</span>
          Shop<span className="brand-accent">Kart</span>
        </Link>

        <nav className="nav-links">
          {user ? (
            <>
              <NavLink to="/home" className="nav-link">
                Home
              </NavLink>
              <NavLink to="/products" className="nav-link">
                Products
              </NavLink>
              {/* Count comes from the server (user.wishlist ids) */}
              <NavLink to="/wishlist" className="nav-link">
                Wishlist
                {user.wishlist && (
                  <span className="nav-count">{user.wishlist.length}</span>
                )}
              </NavLink>
              {/* Total units in the cart, e.g. Keyboard x2 + Mouse x1 = 3 */}
              <NavLink to="/cart" className="nav-link">
                Cart<span className="nav-count">{itemCount}</span>
              </NavLink>
              <NavLink to="/orders" className="nav-link">
                Orders
              </NavLink>
              <span className="nav-user">Hi, {user.fullName.split(" ")[0]}</span>
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="nav-link">
                Login
              </NavLink>
              <NavLink to="/register" className="nav-link">
                Register
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
