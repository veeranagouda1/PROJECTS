import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";

/**
 * Gateway route protection:
 *   /api/auth/**    → permitAll
 *   /api/admin/**   → hasRole("ADMIN")   → role claim = "ADMIN"
 *   /api/user/**    → hasAnyRole("USER", "ADMIN")
 *   anyExchange     → authenticated
 *
 * Frontend mirrors this:
 *   /           → public (Landing)
 *   /dashboard  → USER or ADMIN
 *   /admin      → ADMIN only
 */
function ProtectedRoute({ children, adminOnly = false }) {
  const { accessToken, user } = useSelector((state) => state.auth);

  if (!accessToken) return <Navigate to="/" replace />;

  if (adminOnly && user?.role !== "ADMIN") {
    // ADMIN tried /admin but role doesn't match — shouldn't happen normally
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />

        {/* USER dashboard — accessible by USER and ADMIN */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* ADMIN dashboard — ADMIN only */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}