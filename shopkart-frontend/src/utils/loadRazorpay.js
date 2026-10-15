const SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

let loadingPromise = null;

// Adds Razorpay's Checkout script to the page (only once).
// Resolves true when window.Razorpay is ready, false if it failed to load.
const loadRazorpay = () => {
  if (window.Razorpay) return Promise.resolve(true);

  if (!loadingPromise) {
    loadingPromise = new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = SCRIPT_URL;
      script.onload = () => resolve(true);
      script.onerror = () => {
        script.remove();
        loadingPromise = null; // allow another try later
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  return loadingPromise;
};

export default loadRazorpay;
