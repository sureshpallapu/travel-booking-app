import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import places from "../data/places";
import "./booking.css";

function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const place = places.find((p) => p.id === Number(id));
  const today = new Date().toISOString().split("T")[0];

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    travel_date: "",
    people: 1,
  });

  if (!place) return <h2 className="error">Package not found</h2>;

  /* ---------- HANDLE INPUT ---------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "people" ? Number(value) : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  /* ---------- VALIDATION ---------- */
  const validateForm = () => {
    const e = {};
    if (form.name.trim().length < 3) e.name = "Name too short";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Invalid email";
    if (!form.location) e.location = "City required";
    if (!form.travel_date || form.travel_date < today)
      e.travel_date = "Invalid date";
    if (form.people < 1) e.people = "Invalid people count";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ---------- SUBMIT ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      ...form,
      phone: form.phone || null,
      place_name: place.name,
      price: Number(place.price),
    };

    try {
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/bookings`,
        payload,
        {
          headers: {
            "Content-Type": "application/json", // 🔥 IMPORTANT
          },
        }
      );

      if (res.status === 201) {
        navigate("/success", { state: { booking: res.data, place } });
      }
    } catch (err) {
      console.error("Booking error:", err);
      alert("Booking failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <section className="booking-container">
      <div className="booking-card">
        <h2>{place.name}</h2>
        <p className="price">₹ {place.price.toLocaleString()}</p>

        <form onSubmit={handleSubmit} className="booking-form">
          <input name="name" value={form.name} onChange={handleChange} required />
          {errors.name && <span>{errors.name}</span>}

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
          {errors.email && <span>{errors.email}</span>}

          <input name="phone" value={form.phone} onChange={handleChange} />
          <input name="location" value={form.location} onChange={handleChange} required />

          <input
            type="date"
            name="travel_date"
            min={today}
            value={form.travel_date}
            onChange={handleChange}
            required
          />
          {errors.travel_date && <span>{errors.travel_date}</span>}

          <input
            type="number"
            name="people"
            min="1"
            value={form.people}
            onChange={handleChange}
          />

          <button disabled={loading}>
            {loading ? "Booking..." : "Confirm Booking"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default Booking;
