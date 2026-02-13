import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/admin.css";
import AdminCharts from "../components/AdminCharts";
import AnimatedNumber from "../components/AnimatedNumber";

const PAGE_SIZE = 10;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const chartsRef = useRef(null);

  /* ================= STATE ================= */
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const [view, setView] = useState("DASHBOARD");

  /* ================= EDIT STATE ================= */
  const [editingBooking, setEditingBooking] = useState(null);

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    people: "",
    price: "",
  });

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

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this booking?"
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("adminToken");

      await axios.delete(
        `${import.meta.env.VITE_API_URL}/admin/bookings/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch (error) {
      console.error(error);
      alert("Failed to delete booking");
    }
  };

  /* ================= EDIT ================= */
  const handleEditClick = (booking) => {
    setEditingBooking(booking);
    setEditForm({
      name: booking.name || "",
      email: booking.email || "",
      people: booking.people || "",
      price: booking.price || "",
    });
  };

  const handleUpdate = async () => {
    if (!editingBooking) return;

    try {
      const token = localStorage.getItem("adminToken");

      await axios.put(
        `${import.meta.env.VITE_API_URL}/admin/bookings/${editingBooking.id}`,
        editForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setBookings((prev) =>
        prev.map((b) =>
          b.id === editingBooking.id
            ? { ...b, ...editForm }
            : b
        )
      );

      setEditingBooking(null);
    } catch (error) {
      console.error(error);
      alert("Failed to update booking");
    }
  };

  /* ================= AUTH + FETCH ================= */
  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      navigate("/admin/login");
      return;
    }

    axios
      .get(`${import.meta.env.VITE_API_URL}/admin/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setBookings(res.data);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
      });
  }, [navigate]);

  /* ================= DERIVED DATA ================= */
  const totalRevenue = bookings.reduce(
    (sum, b) => sum + Number(b.price),
    0
  );

  const totalTravelers = bookings.reduce(
    (sum, b) => sum + Number(b.people),
    0
  );

  const today = new Date().toISOString().split("T")[0];

  let filteredData = bookings;

  if (filter === "TODAY") {
    filteredData = filteredData.filter((b) =>
      b.travel_date.startsWith(today)
    );
  }

  if (filter === "REVENUE") {
    filteredData = [...filteredData].sort(
      (a, b) => Number(b.price) - Number(a.price)
    );
  }

  if (search) {
    filteredData = filteredData.filter((b) =>
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
            {loading ? (
              <div className="skeleton-grid">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="skeleton-card"></div>
                ))}
              </div>
            ) : (
              <>
                <div className="stats-grid">
                  <div
                    className="stat-card"
                    onClick={() => setFilter("ALL")}
                  >
                    <h3>Total Bookings</h3>
                    <p>
                      <AnimatedNumber value={bookings.length} />
                    </p>
                  </div>

                  <div
                    className="stat-card"
                    onClick={() => setFilter("REVENUE")}
                  >
                    <h3>Total Revenue</h3>
                    <p>
                      ₹<AnimatedNumber value={totalRevenue} />
                    </p>
                  </div>

                  <div className="stat-card">
                    <h3>Total Travelers</h3>
                    <p>
                      <AnimatedNumber value={totalTravelers} />
                    </p>
                  </div>

                  <div
                    className="stat-card"
                    onClick={() => setFilter("TODAY")}
                  >
                    <h3>Today’s Bookings</h3>
                    <p>
                      <AnimatedNumber
                        value={
                          bookings.filter((b) =>
                            b.travel_date.startsWith(today)
                          ).length
                        }
                      />
                    </p>
                  </div>
                </div>

                <div ref={chartsRef}>
                  <AdminCharts bookings={bookings} />
                </div>
              </>
            )}
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
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Place</th>
                    <th>Date</th>
                    <th>People</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: "center", padding: "30px" }}>
                        No bookings found
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((b) => (
                      <tr key={b.id}>
                        <td>{b.id}</td>
                        <td>{b.name}</td>
                        <td>{b.email}</td>
                        <td>{b.place_name}</td>
                        <td>
                          {new Date(b.travel_date).toLocaleDateString()}
                        </td>
                        <td>{b.people}</td>
                        <td>₹{b.price}</td>
                        <td>
                          <button
                            className="edit-btn"
                            onClick={() => handleEditClick(b)}
                          >
                            Edit
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(b.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ===== EDIT MODAL ===== */}
        {editingBooking && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Edit Booking</h3>

              <input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                placeholder="Name"
              />

              <input
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
                placeholder="Email"
              />

              <input
                type="number"
                value={editForm.people}
                onChange={(e) =>
                  setEditForm({ ...editForm, people: e.target.value })
                }
                placeholder="People"
              />

              <input
                type="number"
                value={editForm.price}
                onChange={(e) =>
                  setEditForm({ ...editForm, price: e.target.value })
                }
                placeholder="Price"
              />

              <div className="modal-actions">
                <button onClick={handleUpdate}>Save</button>
                <button onClick={() => setEditingBooking(null)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
