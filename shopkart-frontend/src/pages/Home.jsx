import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getCurrentCustomer } from "../services/api";

const getInitials = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Protected route: ask the server who is logged in (using the HttpOnly
  // cookie). If the server says 401, the user is not authenticated.
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
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="loader-screen">
        <div className="spinner" />
        <p>Loading your account...</p>
      </div>
    );
  }

  if (!user) return null;

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <>
      <Navbar user={user} />
      <main className="home">
        <section className="welcome-banner">
          <div>
            <p className="welcome-eyebrow">Welcome to ShopKart</p>
            <h1 className="welcome-title">Hello, {user.fullName}! 👋</h1>
            <p className="welcome-text">
              You're logged in. Explore today's deals and manage your account below.
            </p>
          </div>
        </section>

        <section className="profile-card">
          <div className="profile-header">
            <div className="avatar">{getInitials(user.fullName)}</div>
            <div>
              <h2 className="profile-name">{user.fullName}</h2>
              {memberSince && (
                <p className="profile-meta">Member since {memberSince}</p>
              )}
            </div>
          </div>

          <dl className="profile-details">
            <div className="detail-row">
              <dt>Full Name</dt>
              <dd>{user.fullName}</dd>
            </div>
            <div className="detail-row">
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div className="detail-row">
              <dt>Phone Number</dt>
              <dd>{user.phone}</dd>
            </div>
          </dl>
        </section>
      </main>
    </>
  );
}

export default Home;
