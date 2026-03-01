const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");

// ✅ Create only ONE instance
const razorpay = new Razorpay({
  key_id:"rzp_test_SLuWOZ9GWH4GTe",
  key_secret:"zat6iKQzzugnC0ZS0Bin2S2j",
});


router.get("/razorpay-key", (req, res) => {
  res.json({
    key: process.env.RAZORPAY_KEY_ID
  });
});
router.post("/create-order", async (req, res) => {
  try {

    console.log("KEY ID:", process.env.RAZORPAY_KEY_ID ? "Present" : "Missing");
    console.log("KEY SECRET:", process.env.RAZORPAY_KEY_SECRET ? "Present" : "Missing");
    console.log("🔥 Razorpay route loaded");

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    res.json({
      ...order,
      key: process.env.RAZORPAY_KEY_ID,   // 🔥 send key to frontend
    });

  } catch (err) {
    console.error("ORDER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;