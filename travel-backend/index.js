import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import pkg from "pg";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";

const { Pool } = pkg;
const app = express();

/* ================= ENV CHECK ================= */
if (!process.env.DATABASE_URL || !process.env.JWT_SECRET) {
  console.error("❌ Missing DATABASE_URL or JWT_SECRET");
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

/* ================= RATE LIMIT ================= */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
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

/* ================= ADMIN LOGIN ================= */
app.post("/admin/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Missing credentials" });

    const result = await pool.query(
      "SELECT * FROM admins WHERE email = $1",
      [email]
    );

    if (!result.rows.length)
      return res.status(401).json({ error: "Invalid credentials" });

    const admin = result.rows[0];
    const match = await bcrypt.compare(password, admin.password);
    if (!match)
      return res.status(401).json({ error: "Invalid credentials" });

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

/* ================= ADMIN BOOKINGS ================= */
app.get("/admin/bookings", async (req, res) => {
  try {
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = auth.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET);

    const result = await pool.query(
      "SELECT * FROM bookings ORDER BY created_at DESC"
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ ADMIN BOOKINGS ERROR:", err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

/* ================= SERVER ================= */
app.listen(process.env.PORT, () => {
  console.log(`✅ Backend running on port ${process.env.PORT}`);
});
