const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");

// Razorpay instance
const razorpay = new Razorpay({
  key_id: "rzp_test_SLuWOZ9GWH4GTe",
  key_secret: "zat6iKQzzugnC0ZS0Bin2S2j",
});

// Send key to frontend
router.get("/razorpay-key", (req, res) => {
  res.json({
    key: "rzp_test_SLuWOZ9GWH4GTe",
  });
});

// Create Order
router.post("/create-order", async (req, res) => {
  try {
    const amount = parseInt(req.body.amount);

    if (!amount) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: "rzp_test_SLuWOZ9GWH4GTe",
    });

  } catch (err) {
    console.error("ORDER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// Verify Payment
router.post("/verify", (req, res) => {

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", "zat6iKQzzugnC0ZS0Bin2S2j")
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

module.exports = router;