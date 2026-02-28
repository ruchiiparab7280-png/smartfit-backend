const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post("/create-order", async (req, res) => {
  try {

    const options = {
      amount: 4999 * 100,
      currency: "INR",
      receipt: "order_rcptid_11"
    };

    const order = await razorpay.orders.create(options);

    res.json(order);

  } catch (err) {
    console.log(err);
    res.status(500).send("Error creating order");
  }
});

module.exports = router;