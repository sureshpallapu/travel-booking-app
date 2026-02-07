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
    date: "",
    people: 1,
  });

  if (!place) return <h2 className="error">Package not found</h2>;

  /* Handle input */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  /* Validation */
  const validateForm = () => {
    const newErrors = {};

    if (!form.name || form.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }

    if (form.phone && !/^\d{10}$/.test(form.phone)) {
      newErrors.phone = "Phone must be 10 digits";
    }

    if (!form.location) {
      newErrors.location = "City is required";
    }

    if (!form.date) {
      newErrors.date = "Travel date is required";
    } else if (form.date < today) {
      newErrors.date = "Past dates are not allowed";
    }

    if (form.people < 1) {
      newErrors.people = "At least 1 person required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* Submit */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:4000/bookings", {
        ...form,
        placeName: place.name,
        price: place.price, // NUMBER ONLY
      });

      if (res.status === 201 && res.data.id) {
        navigate("/success", {
          state: { booking: res.data, place },
        });
      } else {
        alert("Booking failed");
      }
    } catch (err) {
      console.error(err);
      alert("Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="booking-container">
      <div className="booking-card">
        <h2>{place.name}</h2>
        <p className="price">₹ {place.price.toLocaleString()}</p>

        <form onSubmit={handleSubmit} className="booking-form">
          <input name="name" placeholder="Full Name" onChange={handleChange} />
          {errors.name && <span className="error-text">{errors.name}</span>}

          <input type="email" name="email" placeholder="Email" onChange={handleChange} />
          {errors.email && <span className="error-text">{errors.email}</span>}

          <input name="phone" placeholder="Phone (optional)" onChange={handleChange} />
          {errors.phone && <span className="error-text">{errors.phone}</span>}

          <input name="location" placeholder="City" onChange={handleChange} />
          {errors.location && <span className="error-text">{errors.location}</span>}

          <input
            type="date"
            name="date"
            min={today}
            onChange={handleChange}
          />
          {errors.date && <span className="error-text">{errors.date}</span>}

          <input
            type="number"
            name="people"
            min="1"
            value={form.people}
            onChange={handleChange}
          />
          {errors.people && <span className="error-text">{errors.people}</span>}

          <button type="submit" disabled={loading}>
            {loading ? "Booking..." : "Confirm Booking"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default Booking;
