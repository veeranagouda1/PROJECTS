import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";

// ─── Protects routes — redirects to / if no token ─────────
function ProtectedRoute({ children, requiredRole }) {
  const { accessToken, user } = useSelector((state) => state.auth);

  if (!accessToken) return <Navigate to="/" replace />;

  // Role check
  if (requiredRole && user?.role !== requiredRole) {
    // Wrong role → send to their correct dashboard
    return <Navigate to={user?.role === "ADMIN" ? "/admin" : "/dashboard"} replace />;
  }

  return children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />

        {/* USER dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* ADMIN dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}