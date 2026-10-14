import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentCustomer } from "../services/api";

// Asks the server who is logged in (using the HttpOnly cookie).
// If the server says 401, the user is sent to the login page.
function useCurrentUser() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let ignore = false;

    getCurrentCustomer()
      .then((res) => {
        if (!ignore) setUser(res.data);
      })
      .catch(() => {
        if (!ignore) navigate("/login", { replace: true });
      })
      .finally(() => {
        if (!ignore) setChecking(false);
      });

    return () => {
      ignore = true;
    };
  }, [navigate]);

  // Replaces the user's wishlist ids with the list the server sent back
  // after an add/remove, so the Navbar count stays in sync.
  const setWishlistIds = useCallback(
    (ids) => setUser((prev) => (prev ? { ...prev, wishlist: ids } : prev)),
    []
  );

  return { user, checking, setWishlistIds };
}

export default useCurrentUser;
