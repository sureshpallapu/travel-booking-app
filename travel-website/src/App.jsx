import "./styles/main.css";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Destinations from "./pages/Destinations";
import PlaceDetails from "./pages/PlaceDetails";
import Booking from "./pages/Booking";
import BookingSuccess from "./pages/BookingSuccess";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminPage && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/destinations" element={<Destinations />} />
        <Route path="/place/:id" element={<PlaceDetails />} />
        <Route path="/book/:id" element={<Booking />} />
        <Route path="/success" element={<BookingSuccess />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>

      {!isAdminPage && <Footer />}
    </>
  );
}

export default App;
