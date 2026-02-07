import { Link } from "react-router-dom";

function PlaceCard({ place }) {
  return (
    <div className="card">
      <img src={place.image} alt={place.name} />

      <h3>{place.name}</h3>

      <Link to={`/book/${place.id}`}>
        <button className="book-btn">Book Now</button>
      </Link>
    </div>
  );
}

export default PlaceCard;
