import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import pkg from "pg";

const { Pool } = pkg;
const app = express();

/* ================= ENV CHECK ================= */
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL missing");
  process.exit(1);
}

/* ================= MIDDLEWARE ================= */
app.use(cors({ origin: "*", methods: ["GET", "POST"] }));
app.use(express.json());

/* ================= DATABASE ================= */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

/* ================= HEALTH ================= */
app.get("/", (_, res) => {
  res.send("Backend running");
});

/* ================= BOOKINGS ================= */
app.post("/bookings", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      location,
      travel_date,
      people,
      place_name,
      price,
    } = req.body;

    if (
      !name ||
      !email ||
      !location ||
      !travel_date ||
      !place_name ||
      !price ||
      Number(people) < 1
    ) {
      return res.status(400).json({ error: "Invalid booking data" });
    }

    const result = await pool.query(
      `
      INSERT INTO bookings
      (name, email, phone, location, travel_date, people, place_name, price)
      VALUES ($1,$2,$3,$4,$5::date,$6,$7,$8)
      RETURNING *
      `,
      [
        name.trim(),
        email.trim(),
        phone || null,
        location.trim(),
        travel_date,
        Number(people),
        place_name.trim(),
        Number(price),
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ BOOKING ERROR:", err);
    res.status(500).json({ error: "Booking failed" });
  }
});

/* ================= SERVER ================= */
app.listen(process.env.PORT, () => {
  console.log(`✅ Backend running on port ${process.env.PORT}`);
});
