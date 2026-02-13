import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/admin.css";
import AdminCharts from "../components/AdminCharts";
import AnimatedNumber from "../components/AnimatedNumber";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


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
const [deleteId, setDeleteId] = useState(null);
const [recentlyDeleted, setRecentlyDeleted] = useState(null);
const [deleteLoading, setDeleteLoading] = useState(false);
const [sortConfig, setSortConfig] = useState({
  key: null,
  direction: "asc",
});
const [selectedIds, setSelectedIds] = useState([]);


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
const handleDelete = async () => {
  if (!deleteId) return;

  const bookingToDelete = bookings.find(b => b.id === deleteId);

  // Remove immediately from UI
  setBookings(prev => prev.filter(b => b.id !== deleteId));
  setDeleteId(null);

  setRecentlyDeleted(bookingToDelete);

  const toastId = toast(
    (t) => (
      <span>
        Booking deleted.
        <button
          onClick={() => {
            // Restore booking
            setBookings(prev => [bookingToDelete, ...prev]);
            setRecentlyDeleted(null);
            toast.dismiss(t.id);
          }}
          style={{
            marginLeft: "10px",
            color: "#2563eb",
            fontWeight: "600",
            background: "none",
            border: "none",
            cursor: "pointer"
          }}
        >
          Undo
        </button>
      </span>
    ),
    { duration: 5000 }
  );

  // Wait 5 seconds before real delete
  setTimeout(async () => {
    if (!recentlyDeleted) return;

    try {
      const token = localStorage.getItem("adminToken");

      await axios.delete(
        `${import.meta.env.VITE_API_URL}/admin/bookings/${bookingToDelete.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

    } catch (error) {
      console.error("Permanent delete failed", error);
    }

    setRecentlyDeleted(null);
  }, 5000);
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

  const toastId = toast.loading("Updating booking...");

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

    toast.success("Booking updated successfully", { id: toastId });

  } catch (error) {
    toast.error("Failed to update booking", { id: toastId });
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

/* ===== FILTERING ===== */
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

/* ===== SORTING ===== */
if (sortConfig.key) {
  filteredData = [...filteredData].sort((a, b) => {
    if (sortConfig.key === "price") {
      return sortConfig.direction === "asc"
        ? Number(a.price) - Number(b.price)
        : Number(b.price) - Number(a.price);
    }

    if (sortConfig.key === "travel_date") {
      return sortConfig.direction === "asc"
        ? new Date(a.travel_date) - new Date(b.travel_date)
        : new Date(b.travel_date) - new Date(a.travel_date);
    }

    return sortConfig.direction === "asc"
      ? String(a[sortConfig.key]).localeCompare(
          String(b[sortConfig.key])
        )
      : String(b[sortConfig.key]).localeCompare(
          String(a[sortConfig.key])
        );
  });
}

/* ===== PAGINATION ===== */
const totalPages = Math.ceil(
  filteredData.length / PAGE_SIZE
);

const paginatedData = filteredData.slice(
  (page - 1) * PAGE_SIZE,
  page * PAGE_SIZE
);
const handleSort = (key) => {
  let direction = "asc";

  if (
    sortConfig.key === key &&
    sortConfig.direction === "asc"
  ) {
    direction = "desc";
  }

  setSortConfig({ key, direction });
};




const exportToExcel = () => {
  const data = filteredData.map((b) => ({
    ID: b.id,
    Name: b.name,
    Email: b.email,
    Place: b.place_name,
    Date: new Date(b.travel_date).toLocaleDateString(),
    People: b.people,
    Price: b.price,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const fileData = new Blob([excelBuffer], {
    type: "application/octet-stream",
  });

  saveAs(fileData, "bookings.xlsx");
};



const exportToPDF = () => {
  const doc = new jsPDF();

  const tableColumn = [
    "ID",
    "Name",
    "Email",
    "Place",
    "Date",
    "People",
    "Price",
  ];

  const tableRows = filteredData.map((b) => [
    b.id,
    b.name,
    b.email,
    b.place_name,
    new Date(b.travel_date).toLocaleDateString(),
    b.people,
    b.price,
  ]);

  doc.text("Bookings Report", 14, 15);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 20,
  });

  doc.save("bookings.pdf");
};








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

  <div style={{ display: "flex", gap: "10px" }}>
    <button onClick={exportToExcel} className="export-btn">
      Export Excel
    </button>

    <button onClick={exportToPDF} className="export-btn">
      Export PDF
    </button>
  </div>
</div>


            <div className="table-wrapper">
              {selectedIds.length > 0 && (
  <button
    className="danger-btn"
    onClick={() => selectedIds.forEach(id => setDeleteId(id))}
  >
    Delete Selected ({selectedIds.length})
  </button>
)}

              <table>
  <thead>
    <tr>
      {/* Select All Checkbox */}
      <th>
        <input
          type="checkbox"
          checked={
            paginatedData.length > 0 &&
            selectedIds.length === paginatedData.length
          }
          onChange={(e) =>
            setSelectedIds(
              e.target.checked
                ? paginatedData.map((b) => b.id)
                : []
            )
          }
        />
      </th>

      <th>ID</th>

      <th
        onClick={() => handleSort("name")}
        className="sortable"
      >
        Name{" "}
        {sortConfig.key === "name" &&
          (sortConfig.direction === "asc" ? "↑" : "↓")}
      </th>

      <th>Email</th>
      <th>Place</th>

      <th
        onClick={() => handleSort("travel_date")}
        className="sortable"
      >
        Date{" "}
        {sortConfig.key === "travel_date" &&
          (sortConfig.direction === "asc" ? "↑" : "↓")}
      </th>

      <th>People</th>

      <th
        onClick={() => handleSort("price")}
        className="sortable"
      >
        Price{" "}
        {sortConfig.key === "price" &&
          (sortConfig.direction === "asc" ? "↑" : "↓")}
      </th>

      <th>Actions</th>
    </tr>
  </thead>

  <tbody>
    {paginatedData.length === 0 ? (
      <tr>
        <td colSpan="9" style={{ textAlign: "center", padding: "30px" }}>
          No bookings found
        </td>
      </tr>
    ) : (
      paginatedData.map((b) => (
        <tr key={b.id}>
          {/* Row Checkbox */}
          <td>
            <input
              type="checkbox"
              checked={selectedIds.includes(b.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedIds([...selectedIds, b.id]);
                } else {
                  setSelectedIds(
                    selectedIds.filter((id) => id !== b.id)
                  );
                }
              }}
            />
          </td>

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
              onClick={() => setDeleteId(b.id)}
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
        {/* ===== DELETE CONFIRM MODAL ===== */}
{deleteId && (
  <div className="modal-overlay">
    <div className="modal">
      <h3>Delete Booking</h3>
      <p style={{ fontSize: "14px", color: "#64748b" }}>
        Are you sure you want to delete this booking?
      </p>

      <div className="modal-actions">
        <button
  className="danger-btn"
  onClick={handleDelete}
  disabled={deleteLoading}
>
  {deleteLoading ? (
    <span className="spinner"></span>
  ) : (
    "Yes, Delete"
  )}
</button>


        <button
          onClick={() => setDeleteId(null)}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
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
