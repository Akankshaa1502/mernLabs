import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import WishlistCard from "../components/WishlistCard";
import useCurrentUser from "../hooks/useCurrentUser";
import { getWishlist } from "../services/api";

function Wishlist() {
  const { user, checking, setWishlistIds } = useCurrentUser();

  // Bumping reloadKey re-runs the fetch (used by "Try Again")
  const [reloadKey, setReloadKey] = useState(0);

  // Result of the last finished request, tagged with the reloadKey it was
  // for. Until it matches the current reloadKey, we are still loading.
  const [result, setResult] = useState({ key: null, items: [], error: "" });
  const loading = result.key !== reloadKey;
  const { items, error } = result;

  useEffect(() => {
    let ignore = false;

    getWishlist()
      .then((res) => {
        if (ignore) return;
        const products = res.data.wishlist;
        setResult({ key: reloadKey, items: products, error: "" });
        // Keep the Navbar count equal to what is actually shown here
        setWishlistIds(products.map((p) => p._id));
      })
      .catch(() => {
        if (!ignore) {
          setResult({
            key: reloadKey,
            items: [],
            error: "We couldn't load your wishlist.",
          });
        }
      });

    return () => {
      ignore = true;
    };
  }, [reloadKey, setWishlistIds]);

  if (checking) {
    return (
      <div className="loader-screen">
        <div className="spinner" />
        <p>Loading your account...</p>
      </div>
    );
  }

  if (!user) return null;

  const handleRemoved = (productId, ids) => {
    setResult((prev) => ({
      ...prev,
      items: prev.items.filter((p) => p._id !== productId),
    }));
    setWishlistIds(ids ?? (user.wishlist || []).filter((id) => id !== productId));
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="state-box">
          <div className="spinner" />
          <p>Loading your wishlist...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="state-box state-error">
          <p className="state-title">Something went wrong.</p>
          <p>{error}</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setReloadKey((k) => k + 1)}
          >
            Try Again
          </button>
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div className="state-box">
          <p className="state-icon" aria-hidden="true">❤️</p>
          <p className="state-title">Your wishlist is empty</p>
          <p>Save products you love and find them here later.</p>
          <Link to="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      );
    }

    return (
      <div className="product-grid">
        {items.map((product) => (
          <WishlistCard
            key={product._id}
            product={product}
            onRemoved={handleRemoved}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <Navbar user={user} />
      <main className="products-page">
        <div className="page-header">
          <h1 className="page-title">My Wishlist</h1>
          {!loading && !error && items.length > 0 && (
            <p className="page-subtitle">
              {items.length} {items.length === 1 ? "product" : "products"} saved
            </p>
          )}
        </div>

        {renderContent()}

        {!loading && !error && items.length > 0 && (
          <Link to="/products" className="back-link continue-link">
            ← Continue shopping
          </Link>
        )}
      </main>
    </>
  );
}

export default Wishlist;
