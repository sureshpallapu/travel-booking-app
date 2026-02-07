import { useState } from "react";
import places from "../data/places";
import PlaceCard from "../components/PlaceCard";
import FilterBar from "../components/FilterBar";
import ScrollReveal from "../components/ScrollReveal";

function Destinations() {
  const [activeState, setActiveState] = useState("All");
  const [search, setSearch] = useState("");

  const filteredPlaces = places.filter(place => {
    const matchState =
      activeState === "All" || place.state === activeState;

    const matchSearch = place.name
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchState && matchSearch;
  });

  return (
    <section className="section">
      <h2>Tour Packages</h2>

      <FilterBar
        activeState={activeState}
        setActiveState={setActiveState}
        search={search}
        setSearch={setSearch}
      />

      <div className="grid">
        {filteredPlaces.map(place => (
          <ScrollReveal key={place.id}>
            <PlaceCard place={place} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}

export default Destinations;
