console.log("🔥 FINAL SERVER RUNNING");
require("dotenv").config();
const express = require("express");

const cors = require("cors");
console.log("KEY_ID:", process.env.RAZORPAY_KEY_ID);
console.log("KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET);



const bcrypt = require("bcrypt");const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://fcuewjjxhgwpgwhxxeht.supabase.co",
  "sb_publishable_EKFKAzBXesy3253E2ggfow_b2ZdIZPT"
);

const app = express();

app.use(cors({
  origin: [
    "http://localhost:4028",
    "https://smartfit-frontend-taupe.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
  credentials: true
}));
app.use(express.json());

const ownerRoutes = require("./routes/ownerRoutes");
app.use("/api/owner", ownerRoutes);

const userDashboardRoute = require("./routes/userDashboard");
app.use("/api/user", userDashboardRoute);


const paymentRoutes = require("./routes/paymentRoutes");
app.use("/payment", paymentRoutes);

/* ================= TEST ================= */

app.get("/", (req, res) => {
  res.send("Backend Running 🚀");
});

/* ================= SIGNUP ================= */

app.post("/signup", async (req, res) => {

  const { name, email, password, role } = req.body;

  try {

    const { data: existing } = await supabase
      .from("users")
      .select("*")
      .eq("email", email);

    if (existing && existing.length > 0) {
      return res.status(400).json({ message: "Email already registered ❌" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { error } = await supabase
      .from("users")
      .insert([
        { name, email, password: hashedPassword, role }
      ]);

    if (error) throw error;

    // 🔥 SAME OLD PHP STYLE RESPONSE
    if (role === "owner") {
      return res.json({
        message: "Signup successful",
        redirect: "/partner-with-us"
      });
    } else {
      return res.json({
        message: "Signup successful",
        redirect: "/user-dashboard"
      });
    }

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Signup failed ❌" });
  }

});


/* ================= LOGIN ================= */

app.post("/login", async (req, res) => {

  const { email, password } = req.body;

  try {

    const { data: users } = await supabase
      .from("users")
      .select("*")
      .eq("email", email);

    if (!users || users.length === 0) {
      return res.status(400).json({ message: "User not found ❌" });
    }

    const user = users[0];

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Wrong password ❌" });
    }

    let status = "not_submitted";

    if (user.role === "owner") {

      const { data } = await supabase
        .from("gym_owner_requests")
        .select("status")
        .eq("email", email);

      if (data && data.length > 0) {
        status = data[0].status;
      }

    }

    res.json({
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        status
      }
    });

  } catch (err) {
    res.status(500).json({ message: "Server error ❌" });
  }

});




   


/* ================= GYM OWNER REQUEST ================= */

app.post("/gym-owner-request", async (req, res) => {

  try {

    const { error } = await supabase
      .from("gym_owner_requests")
      .insert([{ ...req.body, status: "pending" }]);

    if (error) throw error;

    res.json({ message: "Request Submitted ✅" });

  } catch {
    res.status(500).json({ message: "Request Failed ❌" });
  }

});

/* ================= ADMIN APPROVAL ================= */

app.put("/approve-gym/:email", async (req, res) => {

  const email = req.params.email;

  try {

    const { error: e1 } = await supabase
      .from("gym_owner_requests")
      .update({ status: "approved" })
      .eq("email", email);

    const { error: e2 } = await supabase
      .from("users")
      .update({ role: "owner" })
      .eq("email", email);

    if (e1 || e2) throw new Error();

    res.json({ message: "Gym Owner Approved ✅" });

  } catch {
    res.status(500).json({ message: "Approval failed ❌" });
  }

});




/* ================= GET PENDING REQUESTS ================= */

app.get("/pending-requests", async (req, res) => {

  try {

    const { data, error } = await supabase
      .from("gym_owner_requests")
      .select("*")
      .eq("status", "pending");

    if (error) throw error;

    res.json(data);

  } catch {
    res.status(500).json({ message: "Fetch failed ❌" });
  }

});

/* ================= REJECT GYM ================= */

app.put("/reject-gym/:email", async (req, res) => {

  const email = req.params.email;

  try {

    const { error: e1 } = await supabase
      .from("gym_owner_requests")
      .update({ status: "rejected" })
      .eq("email", email);

    if (e1) throw new Error();

    res.json({ message: "Gym Owner Rejected ❌" });

  } catch {
    res.status(500).json({ message: "Reject failed ❌" });
  }

});



/* ================= CONTACT FORM ================= */

app.post("/contact", async (req, res) => {

  const { full_name, email, message } = req.body;

  try {

    const { error } = await supabase
      .from("contact_messages")
      .insert([
        { full_name, email, message }
      ]);

    if (error) throw error;

    res.json({ message: "Message sent ✅" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed ❌" });
  }

});


const PORT = process.env.PORT || 5000;



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
});
