const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/dashboard/:userId", async (req, res) => {
  try {

    const userId = req.params.userId;

    const [user] = await db.query(
      "SELECT name, email, phone, age, gender, location FROM users WHERE id=?",
      [userId]
    );

    const [memberships] = await db.query(
      "SELECT * FROM memberships WHERE user_id=?",
      [userId]
    );

    const [stats] = await db.query(
      "SELECT * FROM user_stats WHERE user_id=?",
      [userId]
    );

    res.json({
      profile: user[0],
      memberships,
      stats: stats[0]
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Dashboard fetch failed" });
  }
});

module.exports = router;