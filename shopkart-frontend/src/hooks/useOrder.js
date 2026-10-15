import { useEffect, useState } from "react";
import { getOrderById } from "../services/api";

// Loads one order by id. Returns { order, loading, error, reload, setOrder }.
function useOrder(id) {
  const [reloadKey, setReloadKey] = useState(0);
  const requestKey = `${id}|${reloadKey}`;

  // Result of the last finished request, tagged with the request it was
  // for. Until it matches the current id/reloadKey, we are still loading.
  const [result, setResult] = useState({ key: null, order: null, error: "" });
  const loading = result.key !== requestKey;

  useEffect(() => {
    let ignore = false;

    getOrderById(id)
      .then((res) => {
        if (!ignore) setResult({ key: requestKey, order: res.data.order, error: "" });
      })
      .catch((err) => {
        if (ignore) return;
        const status = err.response?.status;
        // 400 = malformed id, 404 = no such order for THIS user
        const message =
          status === 400 || status === 404
            ? "Order not found."
            : "Something went wrong while loading this order.";
        setResult({ key: requestKey, order: null, error: message });
      });

    return () => {
      ignore = true;
    };
  }, [id, requestKey]);

  return {
    order: result.order,
    error: result.error,
    loading,
    reload: () => setReloadKey((k) => k + 1),
    // Replace the order with a newer copy from the server (e.g. after a status update)
    setOrder: (order) => setResult({ key: requestKey, order, error: "" }),
  };
}

export default useOrder;
