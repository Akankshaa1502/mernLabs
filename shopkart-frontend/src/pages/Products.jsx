import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import useCurrentUser from "../hooks/useCurrentUser";
import { getProducts } from "../services/api";

function Products() {
  const { user, checking, setWishlistIds } = useCurrentUser();

  // Filters live in the page URL (/products?search=phone&category=Books)
  // so they survive a refresh and the browser Back button.
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "";

  const [reloadKey, setReloadKey] = useState(0);

  // Result of the last finished request, tagged with the filters it was for.
  // While the current filters don't match that tag, we are still loading.
  const requestKey = `${search}|${category}|${sort}|${reloadKey}`;
  const [result, setResult] = useState({ key: null, products: [], error: "" });
  const loading = result.key !== requestKey;
  const { products, error } = result;

  const updateFilter = (key, value) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true }
    );
  };

  // Fetch from the backend whenever a filter changes
  useEffect(() => {
    let ignore = false;

    // Debounce: wait 300ms so typing "phone" sends one request, not five
    const timer = setTimeout(() => {
      getProducts({ search: search.trim(), category, sort })
        .then((res) => {
          if (!ignore) setResult({ key: requestKey, products: res.data.products, error: "" });
        })
        .catch(() => {
          if (!ignore) {
            setResult({
              key: requestKey,
              products: [],
              error: "Something went wrong while loading products.",
            });
          }
        });
    }, 300);

    // If filters change before this request finishes, cancel the timer and
    // ignore the (now outdated) response so it can't overwrite newer results.
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [search, category, sort, requestKey]);

  if (checking) {
    return (
      <div className="loader-screen">
        <div className="spinner" />
        <p>Loading your account...</p>
      </div>
    );
  }

  if (!user) return null;

  const hasFilters = search || category;

  // Wishlist ids come from the server (/customers/me) and are refreshed
  // from every add/remove response
  const savedIds = new Set(user.wishlist || []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="state-box">
          <div className="spinner" />
          <p>Loading products...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="state-box state-error">
          <p>{error}</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setReloadKey((k) => k + 1)}
          >
            Try again
          </button>
        </div>
      );
    }

    if (products.length === 0) {
      return (
        <div className="state-box">
          <p className="state-title">No products found.</p>
          {hasFilters && <p>Try a different search term or category.</p>}
        </div>
      );
    }

    return (
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            saved={savedIds.has(product._id)}
            onWishlistChange={setWishlistIds}
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
          <h1 className="page-title">Products</h1>
          {!loading && !error && (
            <p className="page-subtitle">
              {products.length} {products.length === 1 ? "product" : "products"}
            </p>
          )}
        </div>

        <SearchBar
          search={search}
          category={category}
          sort={sort}
          onSearchChange={(value) => updateFilter("search", value)}
          onCategoryChange={(value) => updateFilter("category", value)}
          onSortChange={(value) => updateFilter("sort", value)}
        />

        {renderContent()}
      </main>
    </>
  );
}

export default Products;
