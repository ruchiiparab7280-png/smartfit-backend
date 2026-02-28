const express = require("express");
const router = express.Router();
const razorpay = require("../razorpay");

router.post("/create-order", async (req, res) => {

  const options = {
    amount: 499900, // ₹4,999 in paise
    currency: "INR",
    receipt: "smartfit_owner"
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error creating order");
  }

});

module.exports = router;