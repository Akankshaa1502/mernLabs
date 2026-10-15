const Razorpay = require("razorpay");

// The Key Secret is read from .env and only ever used here on the server.
// It is never sent to React or stored in MongoDB.
let instance = null;

const isRazorpayConfigured = () =>
  Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

// Created on first use so the server can still start (and every other
// feature keeps working) before the Razorpay keys are added to .env.
const getRazorpay = () => {
  if (!instance) {
    instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return instance;
};

module.exports = { getRazorpay, isRazorpayConfigured };
