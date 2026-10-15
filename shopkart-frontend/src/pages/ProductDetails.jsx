import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import AddToCartButton from "../components/AddToCartButton";
import WishlistButton from "../components/WishlistButton";
import useCurrentUser from "../hooks/useCurrentUser";
import { getProductById } from "../services/api";
import { formatPrice, getStockStatus } from "../utils/format";

function ProductDetails() {
  // :id from the route /products/:id
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, checking, setWishlistIds } = useCurrentUser();

  // Result of the last finished request, tagged with the id it was for.
  // Until it matches the id in the URL, we are still loading.
  const [result, setResult] = useState({ id: null, product: null, error: "" });
  const loading = result.id !== id;
  const { product, error } = result;

  useEffect(() => {
    let ignore = false;

    getProductById(id)
      .then((res) => {
        if (!ignore) setResult({ id, product: res.data.product, error: "" });
      })
      .catch((err) => {
        if (ignore) return;
        const status = err.response?.status;
        // 400 = malformed id, 404 = valid id but no such product
        const message =
          status === 400 || status === 404
            ? "Product not found."
            : "Something went wrong while loading this product.";
        setResult({ id, product: null, error: message });
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  // Go back in history so the previous search/category is kept. If the
  // page was opened directly (no app history), go to the full list.
  const goBack = () => {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate("/products");
  };

  if (checking) {
    return (
      <div className="loader-screen">
        <div className="spinner" />
        <p>Loading your account...</p>
      </div>
    );
  }

  if (!user) return null;

  const renderContent = () => {
    if (loading) {
      return (
        <div className="state-box">
          <div className="spinner" />
          <p>Loading product...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="state-box state-error">
          <p>{error}</p>
          <Link to="/products" className="btn btn-primary">
            Back to products
          </Link>
        </div>
      );
    }

    const stock = getStockStatus(product.stock);

    return (
      <section className="details-card">
        <div className="details-image-wrap">
          <img src={product.image} alt={product.name} className="details-image" />
        </div>

        <div className="details-info">
          <p className="product-category">{product.category}</p>
          <h1 className="details-name">{product.name}</h1>
          <p className="details-price">{formatPrice(product.price)}</p>
          <p className={`stock-badge stock-${stock.tone}`}>{stock.label}</p>
          <p className="details-description">{product.description}</p>

          <AddToCartButton product={product} className="details-cart-btn" />

          <WishlistButton
            productId={product._id}
            saved={(user.wishlist || []).includes(product._id)}
            onChange={setWishlistIds}
            className="details-cart-btn"
          />
        </div>
      </section>
    );
  };

  return (
    <>
      <Navbar user={user} />
      <main className="products-page">
        <button type="button" className="back-link" onClick={goBack}>
          ← Back to products
        </button>
        {renderContent()}
      </main>
    </>
  );
}

export default ProductDetails;
