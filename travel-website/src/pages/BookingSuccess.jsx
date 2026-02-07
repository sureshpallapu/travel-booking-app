import { useLocation, useNavigate } from "react-router-dom";
import "./booking.css";

function BookingSuccess() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    return (
      <div className="success-card">
        <h2>No booking data</h2>
        <button onClick={() => navigate("/")}>Go Home</button>
      </div>
    );
  }

  const { booking, place } = state;

  return (
    <div className="success-card">
      <h1>Booking Confirmed 🎉</h1>

      <p><strong>Name:</strong> {booking.name}</p>
      <p><strong>Email:</strong> {booking.email}</p>
      <p><strong>Place:</strong> {place.name}</p>
      <p><strong>People:</strong> {booking.people}</p>
      <p><strong>Price:</strong> ₹ {booking.price}</p>

      <button onClick={() => navigate("/")}>Home</button>
    </div>
  );
}

export default BookingSuccess;
