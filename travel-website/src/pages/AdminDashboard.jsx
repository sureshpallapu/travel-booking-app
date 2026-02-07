import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/admin.css";
import AdminCharts from "../components/AdminCharts";

const PAGE_SIZE = 10;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const chartsRef = useRef(null);

  /* ================= STATE ================= */
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved === null ? true : JSON.parse(saved);
  });

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved === "true";
  });

  const [view, setView] = useState("DASHBOARD"); // DASHBOARD | BOOKINGS

  /* ================= HELPERS ================= */
  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("darkMode", next);
  };

  const toggleSidebar = () => {
    const next = !sidebarOpen;
    setSidebarOpen(next);
    localStorage.setItem("sidebarOpen", JSON.stringify(next));
  };

  /* ================= AUTH + FETCH ================= */
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }

    axios
      .get("http://localhost:4000/admin/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => setBookings(res.data))
      .catch(() => {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
      });
  }, []);

  /* ================= DERIVED DATA ================= */
  const totalRevenue = bookings.reduce((s, b) => s + Number(b.price), 0);
  const totalTravelers = bookings.reduce((s, b) => s + Number(b.people), 0);
  const today = new Date().toISOString().split("T")[0];

  let filteredData = bookings;

  if (filter === "TODAY") {
    filteredData = filteredData.filter(b =>
      b.travel_date.startsWith(today)
    );
  }

  if (filter === "REVENUE") {
    filteredData = [...filteredData].sort(
      (a, b) => Number(b.price) - Number(a.price)
    );
  }

  if (search) {
    filteredData = filteredData.filter(b =>
      `${b.name} ${b.email} ${b.place_name}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const paginatedData = filteredData.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  /* ================= UI ================= */
  return (
    <div
      className={`admin-layout ${sidebarOpen ? "" : "collapsed"} ${
        darkMode ? "dark" : ""
      }`}
    >
      {/* ===== SIDEBAR ===== */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="logo">Travel Admin</span>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            ☰
          </button>
        </div>

        <nav>
          <span
            className={view === "DASHBOARD" ? "active" : ""}
            onClick={() => setView("DASHBOARD")}
          >
            <i className="fa-solid fa-chart-line"></i>
            <em>Dashboard</em>
          </span>

          <span
            className={view === "BOOKINGS" ? "active" : ""}
            onClick={() => setView("BOOKINGS")}
          >
            <i className="fa-solid fa-clipboard-list"></i>
            <em>Bookings</em>
          </span>

          <span
            onClick={() => {
              setFilter("REVENUE");
              setView("DASHBOARD");
            }}
          >
            <i className="fa-solid fa-indian-rupee-sign"></i>
            <em>Revenue</em>
          </span>

          <span onClick={() => chartsRef.current?.scrollIntoView()}>
            <i className="fa-solid fa-chart-pie"></i>
            <em>Charts</em>
          </span>
        </nav>
      </aside>

      {/* ===== MAIN ===== */}
      <main className="main-content">
        {/* ===== TOP BAR ===== */}
        <header className="topbar">
          <h1>Welcome, Admin</h1>

          <div className="top-actions">
            <div className="dark-toggle" onClick={toggleDarkMode}>
              <span className={`toggle-thumb ${darkMode ? "on" : ""}`}>
                {darkMode ? "🌙" : "☀️"}
              </span>
            </div>

            <button
              className="logout-btn"
              onClick={() => {
                localStorage.removeItem("adminToken");
                navigate("/admin/login");
              }}
            >
              Logout
            </button>
          </div>
        </header>

        {/* ===== DASHBOARD VIEW ===== */}
        {view === "DASHBOARD" && (
          <>
            <div className="stats-grid">
              <div className="stat-card" onClick={() => setFilter("ALL")}>
                <h3>Total Bookings</h3>
                <p>{bookings.length}</p>
              </div>

              <div className="stat-card" onClick={() => setFilter("REVENUE")}>
                <h3>Total Revenue</h3>
                <p>₹{totalRevenue}</p>
              </div>

              <div className="stat-card">
                <h3>Total Travelers</h3>
                <p>{totalTravelers}</p>
              </div>

              <div className="stat-card" onClick={() => setFilter("TODAY")}>
                <h3>Today’s Bookings</h3>
                <p>
                  {bookings.filter(b =>
                    b.travel_date.startsWith(today)
                  ).length}
                </p>
              </div>
            </div>

            <div ref={chartsRef}>
              <AdminCharts bookings={bookings} />
            </div>
          </>
        )}

        {/* ===== BOOKINGS VIEW ===== */}
        {view === "BOOKINGS" && (
          <>
            <div className="admin-actions">
              <input
                className="search-input"
                placeholder="Search bookings..."
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Place</th>
                    <th>Date</th>
                    <th>People</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map(b => (
                    <tr key={b.id}>
                      <td>{b.name}</td>
                      <td>{b.email}</td>
                      <td>{b.place_name}</td>
                      <td>
                        {new Date(b.travel_date).toLocaleDateString()}
                      </td>
                      <td>{b.people}</td>
                      <td>₹{b.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
