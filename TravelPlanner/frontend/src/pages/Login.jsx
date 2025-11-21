import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { safeStorage, storageKeys } from "../utils/storage";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(2deg); }
      }
      @keyframes glow {
        0%, 100% { box-shadow: 0 0 30px rgba(123, 47, 255, 0.6); }
        50% { box-shadow: 0 0 50px rgba(123, 47, 255, 0.9); }
      }
      @keyframes slideInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      .bg-element {
        animation: float 6s ease-in-out infinite;
      }
      .glow-element {
        animation: glow 3s ease-in-out infinite;
      }
      .form-container {
        animation: slideInUp 0.8s ease-out;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

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
      if (!formData.email || !formData.password) {
        setError("Please fill in all fields");
        setLoading(false);
        return;
      }

      const response = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      const { token, role, email, userId } = response.data;

      if (!token) {
        setError("No token received from server");
        return;
      }

      safeStorage.clearNonEssentialData();

      const roleString = typeof role === 'string' ? role : "TRAVELER";
      const userIdString = userId ? String(userId) : "";
      const emailString = email ? String(email) : "";

      if (!safeStorage.setItem(storageKeys.TOKEN, token)) {
        setError("Failed to save session. Please try again.");
        return;
      }

      safeStorage.setItem(storageKeys.ROLE, roleString);
      safeStorage.setItem(storageKeys.USER_ID, userIdString);
      safeStorage.setItem(storageKeys.USER_EMAIL, emailString);

      if (roleString === "ADMIN") {
        navigate("/admin");
      } else if (roleString === "POLICE") {
        navigate("/police-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      const errorMessage = 
        err.response?.data?.message || 
        err.response?.data?.error ||
        (err.response?.status === 400 ? "Invalid email or password" : "Login failed. Try again.");
      setError(errorMessage);
      console.error("Login error:", err);
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
        background: "linear-gradient(135deg, #0C0E16 0%, #161A27 50%, #1D2131 100%)",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: "-10%", left: "-5%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(0, 210, 255, 0.15) 0%, transparent 70%)", borderRadius: "50%", className: "bg-element" }} />
      <div style={{ position: "absolute", bottom: "-10%", right: "-5%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(123, 47, 255, 0.15) 0%, transparent 70%)", borderRadius: "50%", className: "bg-element" }} />

      <div className="form-container" style={{ maxWidth: "480px", width: "100%", position: "relative", zIndex: 10 }}>
        {/* Header with Animation */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ fontSize: "60px", marginBottom: "20px", className: "glow-element" }}>✈️</div>
          <h1 style={{ color: "#F5F7FF", fontSize: "42px", marginBottom: "10px", fontWeight: "800", letterSpacing: "-1px" }}>
            Welcome Back
          </h1>
          <p style={{ color: "#B4B9CC", fontSize: "16px", marginBottom: "10px" }}>
            Continue your travel journey with us
          </p>
        </div>

        {/* Glass Morphism Card */}
        <div
          style={{
            background: "#161A27",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(123, 47, 255, 0.2)",
            borderRadius: "20px",
            padding: "40px 30px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(123, 47, 255, 0.1)",
          }}
        >
          <form onSubmit={handleSubmit}>
            {/* Email Input */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", marginBottom: "10px", fontWeight: "600", color: "#F5F7FF", fontSize: "14px" }}>
                📧 Email Address
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
                  padding: "14px 16px",
                  borderRadius: "12px",
                  border: "2px solid rgba(123, 47, 255, 0.2)",
                  backgroundColor: "#242A3C",
                  fontSize: "15px",
                  color: "#F5F7FF",
                  outline: "none",
                  transition: "all 0.3s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => { e.target.style.backgroundColor = "#2D3547"; e.target.style.borderColor = "#00D2FF"; e.target.style.boxShadow = "0 0 15px rgba(0, 210, 255, 0.3)"; }}
                onBlur={(e) => { e.target.style.backgroundColor = "#242A3C"; e.target.style.borderColor = "rgba(123, 47, 255, 0.2)"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            {/* Password Input */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", marginBottom: "10px", fontWeight: "600", color: "#F5F7FF", fontSize: "14px" }}>
                🔐 Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: "12px",
                    border: "2px solid rgba(123, 47, 255, 0.2)",
                    backgroundColor: "#242A3C",
                    fontSize: "15px",
                    color: "#F5F7FF",
                    outline: "none",
                    transition: "all 0.3s ease",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => { e.target.style.backgroundColor = "#2D3547"; e.target.style.borderColor = "#00D2FF"; e.target.style.boxShadow = "0 0 15px rgba(0, 210, 255, 0.3)"; }}
                  onBlur={(e) => { e.target.style.backgroundColor = "#242A3C"; e.target.style.borderColor = "rgba(123, 47, 255, 0.2)"; e.target.style.boxShadow = "none"; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "rgba(255,255,255,0.6)",
                    cursor: "pointer",
                    fontSize: "20px",
                  }}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div
                style={{
                  background: "rgba(255, 78, 136, 0.15)",
                  color: "#FF4E88",
                  padding: "14px",
                  borderRadius: "10px",
                  marginBottom: "24px",
                  border: "1px solid rgba(255, 78, 136, 0.3)",
                  fontSize: "14px",
                }}
              >
                ⚠️ {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                fontSize: "16px",
                fontWeight: "700",
                background: loading
                  ? "rgba(123, 47, 255, 0.3)"
                  : "linear-gradient(135deg, #7B2FFF 0%, #C74BFF 100%)",
                color: "#F5F7FF",
                border: "none",
                borderRadius: "12px",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                boxShadow: loading ? "none" : "0 0 20px rgba(123, 47, 255, 0.4), 0 10px 30px rgba(0, 0, 0, 0.3)",
              }}
              onMouseEnter={(e) => !loading && (e.target.style.transform = "translateY(-2px)", e.target.style.boxShadow = "0 0 30px rgba(123, 47, 255, 0.6), 0 15px 40px rgba(0, 0, 0, 0.4)")}
              onMouseLeave={(e) => !loading && (e.target.style.transform = "translateY(0)", e.target.style.boxShadow = "0 0 20px rgba(123, 47, 255, 0.4), 0 10px 30px rgba(0, 0, 0, 0.3)")}
            >
              {loading ? "🔄 Logging in..." : "✨ Login"}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", margin: "24px 0", opacity: 0.7 }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(123, 47, 255, 0.3)" }} />
            <span style={{ color: "#B4B9CC", margin: "0 12px", fontSize: "14px" }}>or</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(123, 47, 255, 0.3)" }} />
          </div>

          {/* Google Login Button */}
          <button
            onClick={() => {
              window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/oauth2/authorization/google`;
            }}
            style={{
              width: "100%",
              padding: "14px",
              fontSize: "15px",
              fontWeight: "600",
              background: "rgba(123, 47, 255, 0.1)",
              color: "#F5F7FF",
              border: "2px solid rgba(123, 47, 255, 0.2)",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              boxShadow: "0 0 15px rgba(123, 47, 255, 0.2)",
            }}
            onMouseEnter={(e) => (e.target.style.background = "rgba(123, 47, 255, 0.15)", e.target.style.borderColor = "rgba(123, 47, 255, 0.4)", e.target.style.boxShadow = "0 0 25px rgba(123, 47, 255, 0.4)")}
            onMouseLeave={(e) => (e.target.style.background = "rgba(123, 47, 255, 0.1)", e.target.style.borderColor = "rgba(123, 47, 255, 0.2)", e.target.style.boxShadow = "0 0 15px rgba(123, 47, 255, 0.2)")}
          >
            🔐 Continue with Google
          </button>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <p style={{ color: "#B4B9CC", fontSize: "14px" }}>
            Don't have an account?{" "}
            <Link
              to="/register"
              style={{
                color: "#00D2FF",
                fontWeight: "600",
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => (e.target.style.textDecoration = "underline", e.target.style.color = "#005CFF", e.target.style.textShadow = "0 0 10px rgba(0, 210, 255, 0.5)")}
              onMouseLeave={(e) => (e.target.style.textDecoration = "none", e.target.style.color = "#00D2FF", e.target.style.textShadow = "none")}
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
