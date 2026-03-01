const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100, // convert to paisa
      currency: "INR",
      receipt: "receipt_" + Date.now()
    };

    const order = await razorpay.orders.create(options);

    return res.json(order);   // ✅ IMPORTANT
  } catch (error) {
    console.error("Razorpay Error:", error);

    return res.status(500).json({
      success: false,
      message: "Error creating order",
      error: error.message
    });   // ✅ send JSON not string
  }
});

module.exports = router;