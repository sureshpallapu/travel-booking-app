import dotenv from "dotenv";
dotenv.config(); // ✅ MUST be first

import express from "express";
import cors from "cors";
import pkg from "pg";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendBookingMail } from "./mailer.js";


const { Pool } = pkg;
const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());

/* ================= DATABASE ================= */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool
  .query("SELECT current_database(), current_schema()")
  .then(res => console.log("✅ DB CONNECTED:", res.rows[0]))
  .catch(err => console.error("❌ DB CONNECTION FAILED:", err));

/* ================= AUTH MIDDLEWARE ================= */
const adminAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch {
    res.sendStatus(403);
  }
};

/* ================= HEALTH ================= */
app.get("/", (req, res) => {
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
      date,
      people,
      placeName,
      price,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO public.bookings
       (name, email, phone, location, travel_date, people, place_name, price)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [name, email, phone, location, date, people, placeName, price]
    );

    const booking = result.rows[0];

    await sendBookingMail(booking);

    res.status(201).json(booking);
  } catch (error) {
    console.error("❌ BOOKING ERROR:", error);
    res.status(500).json({ error: "Booking failed" });
  }
});

/* ================= ADMIN LOGIN ================= */
app.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM admins WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0)
      return res.status(401).json({ error: "Invalid email" });

    const admin = result.rows[0];
    const match = await bcrypt.compare(password, admin.password);

    if (!match)
      return res.status(401).json({ error: "Invalid password" });

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (err) {
    console.error("❌ ADMIN LOGIN ERROR:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

/* ================= ADMIN DASHBOARD ================= */
app.get("/admin/bookings", adminAuth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM bookings ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ ADMIN FETCH ERROR:", err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

/* ================= SERVER ================= */
app.listen(process.env.PORT, () => {
  console.log(`✅ Backend running on http://localhost:${process.env.PORT}`);
});
