import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import SetPassword from "./pages/SetPassword"; // ✅ REQUIRED
import OAuthSuccess from "./pages/OAuthSuccess";

import ProtectedRoute from "./routes/ProtectedRoute";
import OwnerDashboard from "./components/Dashboard/ownerdashboard";
import EditorDashboard from "./components/Dashboard/editordashboard";
import ViewerDashboard from "./components/Dashboard/viewerdashboard";

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/oauth-success" element={<OAuthSuccess />} />
      <Route path="/set-password" element={<SetPassword />} />

      {/* Protected */}
      <Route
        path="/dashboard/owner"
        element={
          <ProtectedRoute>
            <OwnerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/editor"
        element={
          <ProtectedRoute>
            <EditorDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/viewer"
        element={
          <ProtectedRoute>
            <ViewerDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
