console.log("🔥 FINAL SERVER RUNNING");

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();

app.use(cors());
app.use(express.json());

const ownerRoutes = require("./routes/ownerRoutes");
app.use("/api/owner", ownerRoutes);

const userDashboardRoute = require("./routes/userDashboard");
app.use("/api/user", userDashboardRoute);

/* ================= DATABASE ================= */

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "smartfit",
  port: 3307
});

db.connect(err => {
  if (err) {
    console.log("❌ DB Connection Failed:", err);
  } else {
    console.log("✅ MySQL Connected");
  }
});

/* ================= TEST ================= */

app.get("/", (req, res) => {
  res.send("Backend Running 🚀");
});

/* ================= SIGNUP ================= */

app.post("/signup", async (req, res) => {

  const { name, email, password, role } = req.body;

  try {

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {

      if (err) return res.status(500).json({ message: "Database error" });

      if (result.length > 0) {
        return res.status(400).json({ message: "Email already registered ❌" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      db.query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        [name, email, hashedPassword, role],
        (err) => {

          if (err) return res.status(500).json({ message: "Signup failed ❌" });

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

        }
      );

    });

  } catch (error) {
    res.status(500).json({ message: "Server error ❌" });
  }
});


/* ================= LOGIN ================= */

app.post("/login", async (req, res) => {

  const { email, password } = req.body;

  try {

    const [result] = await db.promise().query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (result.length === 0) {
      return res.status(400).json({ message: "User not found ❌" });
    }

    const user = result[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ message: "Wrong password ❌" });
    }

    let status = "approved";

    if (user.role === "owner") {
      const [rows] = await db.promise().query(
        "SELECT status FROM gym_owner_requests WHERE email = ?",
        [user.email]
      );

     if (rows.length > 0) {
  status = rows[0].status;
} else {
  status = "not_submitted";   // ✅ FIXED
}
    }

res.json({
  user: {
    email: user.email,
    name: user.name,
    role: user.role,
    status: status,     // ✅ FIXED
    phone: user.phone
  }
});

  } catch (error) {
    res.status(500).json({ message: "Server error ❌" });
  }

});






   


/* ================= GYM OWNER REQUEST ================= */

app.post("/gym-owner-request", async (req, res) => {

  const {
    full_name,
    phone,
    email,
    business_license,
    gym_type,
    year_established,
    website,
    address,
    city,
    state,
    zip,
    total_area,
    capacity,
    monthly_fee,
    yearly_fee,
    amenities,
    gym_description
  } = req.body;

  try {

    const query = `
INSERT INTO gym_owner_requests
(full_name, email, phone, business_license, gym_type, year_established,
website, address, city, state, zip,
total_area, capacity, monthly_fee, yearly_fee,
amenities, gym_description, status)
VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
`;


   await db.promise().query(query, [
  full_name,
  email,
  phone,
  business_license,
  gym_type,
  year_established,
  website,
  address,
  city,
  state,
  zip,
  total_area,
  capacity,
  monthly_fee,
  yearly_fee,
  amenities,
  gym_description,
  "pending"
]);


    res.json({ message: "Request Submitted ✅" });

  } catch (error) {
    console.log("GYM OWNER INSERT ERROR:", error);
    res.status(500).json({ message: "Request Failed ❌" });
  }

});


/* ================= ADMIN APPROVAL ================= */

app.put("/approve-gym/:email", async (req, res) => {

  const email = req.params.email;

  try {

    await db.promise().query(
      "UPDATE gym_owner_requests SET status='approved' WHERE email=?",
      [email]
    );

    await db.promise().query(
      "UPDATE users SET role='owner' WHERE email=?",
      [email]
    );

    res.json({ message: "Gym Owner Approved ✅" });

  } catch (error) {
    res.status(500).json({ message: "Approval failed ❌" });
  }

});


/* ================= GET PENDING REQUESTS ================= */

app.get("/pending-requests", (req, res) => {

  const query = `
    SELECT * FROM gym_owner_requests
    WHERE status = 'pending'
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });

});
app.get("/test-route", (req, res) => {
  res.send("Test route working");
});


app.post("/api/contact", async (req, res) => {

  const { name, email, message, role } = req.body;

  try {

    await db.promise().query(
      "INSERT INTO contact_messages (full_name, email, message, role) VALUES (?, ?, ?, ?)",
      [name, email, message, role]
    );

    res.json({ message: "Contact saved ✅" });

  } catch (error) {
    console.log("CONTACT ERROR:", error);
    res.status(500).json({ message: "Failed ❌" });
  }

});
app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});



