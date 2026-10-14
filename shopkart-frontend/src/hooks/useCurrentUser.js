import { useEffect, useState } from "react";
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

  return { user, checking };
}

export default useCurrentUser;
