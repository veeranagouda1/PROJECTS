import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";

// Protected route — redirects to / if not logged in
function ProtectedRoute({ children }) {
  const { accessToken } = useSelector((state) => state.auth);
  return accessToken ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}