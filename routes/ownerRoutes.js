const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Check form submitted / pending / approved / rejected
router.get("/check-form/:email", async (req, res) => {

  try {

    const { email } = req.params;

    const [rows] = await db.query(
      "SELECT status FROM gym_owner_requests WHERE email = ? ORDER BY id DESC LIMIT 1",
      [email]
    );

    if (rows.length === 0) {
      return res.json({ status: "not_submitted" });
    }

    return res.json({ status: rows[0].status });

  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Server error" });
  }

});

router.post("/add-workout", async (req, res) => {
  try {
    const { name, duration } = req.body;

    if (!name || !duration) {
      return res.status(400).json({ message: "All fields required" });
    }

    await db.query(
      "INSERT INTO workouts (name, duration) VALUES (?, ?)",
      [name, duration]
    );

    res.json({ message: "Workout added successfully" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});



module.exports = router;