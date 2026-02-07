import { useParams } from "react-router-dom";
import places from "../data/places";

function PlaceDetails() {
  const { id } = useParams();
  const place = places.find(p => p.id === Number(id));

  if (!place) {
    return <h2 style={{ textAlign: "center" }}>Place not found</h2>;
  }

  return (
    <section className="section">
      <div className="details">
        <img src={place.image} alt={place.name} />
        <div>
          <h2>{place.name}, {place.state}</h2>
          <p>🕒 Duration: {place.duration}</p>
          <p>🚍 Journey: {place.journey}</p>
          <p>💰 Package Cost: {place.price}</p>
          <p>
            🌄 Enjoy a well-planned journey with comfortable stays,
            sightseeing, and unforgettable experiences.
          </p>
        </div>
      </div>
    </section>
  );
}

export default PlaceDetails;
