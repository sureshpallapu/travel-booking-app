function FilterBar({ activeState, setActiveState, search, setSearch }) {
  return (
    <div className="filter-bar">
      <div className="filters">
        <button
          className={activeState === "All" ? "active" : ""}
          onClick={() => setActiveState("All")}
        >
          All
        </button>
        <button
          className={activeState === "Karnataka" ? "active" : ""}
          onClick={() => setActiveState("Karnataka")}
        >
          Karnataka
        </button>
        <button
          className={activeState === "Andhra Pradesh" ? "active" : ""}
          onClick={() => setActiveState("Andhra Pradesh")}
        >
          Andhra Pradesh
        </button>
      </div>

      <input
        type="text"
        placeholder="Search places..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
}

export default FilterBar;
