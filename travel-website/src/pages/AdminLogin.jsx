import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/admin-login.css";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
  `${import.meta.env.VITE_API_URL}/admin/login`,
  {
    email,
    password,
  }
);


      localStorage.setItem("adminToken", res.data.token);
      navigate("/admin/dashboard");
    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-bg">
      <form className="login-card" onSubmit={handleLogin}>
        <h2>Admin Login</h2>
        <p className="subtitle">Manage your travel bookings</p>

        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <i
            className={`fa-solid ${
              showPassword ? "fa-eye-slash" : "fa-eye"
            } eye-icon`}
            onClick={() => setShowPassword(!showPassword)}
          />
        </div>

        <div className="forgot-row">
          <span className="forgot-password">Forgot password?</span>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? <span className="spinner"></span> : "Login"}
        </button>
      </form>
    </div>
  );
}
