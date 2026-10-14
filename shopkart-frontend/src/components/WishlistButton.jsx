import { useState } from "react";
import {
  addToWishlist,
  removeFromWishlist,
  getCurrentCustomer,
} from "../services/api";

// Toggles one product in the wishlist.
// saved    -> is the product currently in the wishlist?
// onChange -> receives the wishlist ids the server sent back
function WishlistButton({ productId, saved, onChange, className = "" }) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState(null); // { type: "success" | "error", text }

  const handleClick = async () => {
    if (busy) return; // ignore extra clicks while a request is running

    setBusy(true);
    setNote(null);
    try {
      const res = saved
        ? await removeFromWishlist(productId)
        : await addToWishlist(productId);
      onChange(res.data.wishlist);
      setNote({
        type: "success",
        text: saved ? "Removed from wishlist" : "♥ Added to Wishlist",
      });
    } catch (err) {
      const status = err.response?.status;
      // 409 (already saved) / 404 (already removed): the wishlist was changed
      // somewhere else, e.g. another tab. Reload the real list from the server.
      if ((!saved && status === 409) || (saved && status === 404)) {
        try {
          const me = await getCurrentCustomer();
          onChange(me.data.wishlist);
          return;
        } catch {
          // fall through to the error message below
        }
      }
      setNote({
        type: "error",
        text: saved
          ? "Unable to remove product. Please try again."
          : "Unable to save product. Please try again.",
      });
    } finally {
      setBusy(false);
    }
  };

  let label = saved ? "♥ Remove from Wishlist" : "♡ Add to Wishlist";
  if (busy) label = saved ? "⏳ Removing..." : "⏳ Saving...";

  return (
    <div className="wishlist-action">
      <button
        type="button"
        className={`btn btn-wishlist ${saved ? "is-saved" : ""} ${className}`}
        onClick={handleClick}
        disabled={busy}
        aria-pressed={saved}
      >
        {label}
      </button>
      {note && (
        <p className={`action-note action-note-${note.type}`} role="status">
          {note.text}
        </p>
      )}
    </div>
  );
}

export default WishlistButton;
