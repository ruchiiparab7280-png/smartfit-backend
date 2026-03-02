const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");

// ✅ Create only ONE instance
const razorpay = new Razorpay({
  key_id: "rzp_test_SLuWOZ9GWH4GTe",
  key_secret: "zat6iKQzzugnC0ZS0Bin2S2j",
});

// ✅ Send key to frontend
router.get("/razorpay-key", (req, res) => {
  res.json({
    key: "rzp_test_SLuWOZ9GWH4GTe"
  });
});

// ✅ Create Order
router.post("/create-order", async (req, res) => {
  try {

    const amount = parseInt(req.body.amount);
    console.log("Creating order for:", amount); // ✅ NOW inside

    if (!amount) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order,
      key: "rzp_test_SLuWOZ9GWH4GTe"
    });

  } catch (err) {
    console.error("ORDER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Verify Payment
router.post("/verify", (req, res) => {

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  const sign = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSign = crypto
    .createHmac("sha256", "zat6iKQzzugnC0ZS0Bin2S2j") // ⚠️ must match key_secret
    .update(sign.toString())
    .digest("hex");

  if (razorpay_signature === expectedSign) {
    return res.json({ success: true });
  } else {
    return res.json({ success: false });
  }

});

module.exports = router;