import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { logoutCustomer } from "../services/api";

function Navbar({ user }) {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutCustomer(); // server clears the HttpOnly cookie
    } catch {
      // Even if the request fails (e.g. session already expired),
      // the user should still end up on the login page.
    } finally {
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
