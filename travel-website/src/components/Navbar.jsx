import { Link } from "react-router-dom";
import { useState } from "react";

function Navbar() {
  const [dark, setDark] = useState(false);

  const toggleDark = () => {
    document.body.classList.toggle("dark");
    setDark(!dark);
  };

  return (
    <nav className="navbar">
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/destinations">Destinations</Link></li>
        <li>
          <button className="dark-btn" onClick={toggleDark}>
            {dark ? "☀️ Light" : "🌙 Dark"}
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
