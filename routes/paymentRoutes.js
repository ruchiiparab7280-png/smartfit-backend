const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

router.post("/create-order", async (req, res) => {
  try {

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ message: "Razorpay keys missing" });
    }

    

    const options = {
      amount: req.body.amount * 100,
      currency: "INR",
      receipt: "receipt_order_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    res.json({
  id: order.id,
  amount: order.amount,
  currency: order.currency,
  key: process.env.RAZORPAY_KEY_ID
});

  } catch (err) {
    console.error("ORDER ERROR:", err);
    res.status(500).json({ message: "Order creation failed" });
  }
});
module.exports = router;