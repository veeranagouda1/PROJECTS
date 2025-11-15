import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", formData);

      const { token, role } = response.data;

      if (token) {
        // Save token + role
        localStorage.setItem("token", token);
        if (role) {
          localStorage.setItem("role", role);
        }

        // REDIRECT BASED ON ROLE
        if (role === "ADMIN") {
          navigate("/admin");
        } else if (role === "POLICE") {
        -  navigate("/police");
        +  navigate("/police-dashboard");
        } else {
          navigate("/dashboard");
        }
        
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f5f7fa 0%, #e3eeff 100%)",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "430px",
          width: "100%",
          background: "white",
          borderRadius: "16px",
          padding: "40px",
          boxShadow: "0 10px 40px rgba(102, 126, 234, 0.2)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1
            style={{
              color: "#000",
              fontSize: "32px",
              marginBottom: "10px",
              fontWeight: "700",
            }}
          >
            ✈️ Welcome Back
          </h1>
          <p style={{ color: "#666", fontSize: "16px" }}>
            Login to your Travel Planner
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                color: "#000",
              }}
            >
              📧 Email
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "2px solid #ddd",
                backgroundColor: "#fafafa",
                fontSize: "16px",
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
                color: "#000",
              }}
            >
              🔐 Password
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "2px solid #ddd",
                backgroundColor: "#fafafa",
                fontSize: "16px",
              }}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                background: "#fff5f5",
                color: "#c53030",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "20px",
                border: "1px solid #feb2b2",
                fontSize: "14px",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              fontSize: "16px",
              fontWeight: "600",
              background: loading
                ? "#ccc"
                : "linear-gradient(135deg,#667eea,#764ba2)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "0.2s ease",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Footer */}
        <div
          style={{
            marginTop: "20px",
            textAlign: "center",
            borderTop: "1px solid #eee",
            paddingTop: "20px",
          }}
        >
          <p style={{ color: "#000" }}>
            Don't have an account?{" "}
            <Link
              to="/register"
              style={{
                color: "#667eea",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
