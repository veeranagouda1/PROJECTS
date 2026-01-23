import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { safeStorage, storageKeys } from './utils/storage';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Planner from './pages/Planner';
import BudgetPlanner from './pages/BudgetPlanner';
import Chatbot from './pages/Chatbot';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import PoliceDashboard from './pages/PoliceDashboard';
import SOSLog from './pages/SOSLog';
import GeofenceMap from './pages/GeofenceMap';
import Articles from './pages/Articles';
import EmergencyContactManager from './components/EmergencyContactManager';

// ⭐ ROLE BASED PRIVATE ROUTE
const PrivateRoute = ({ children, allowedRoles }) => {
  const token = safeStorage.getItem(storageKeys.TOKEN);
  const role = safeStorage.getItem(storageKeys.ROLE);

  if (!token) return <Navigate to="/login" />;

  if (!role) return <Navigate to="/login" />;

  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'POLICE') return <Navigate to="/police-dashboard" />;
    if (role === 'ADMIN') return <Navigate to="/admin" />;
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>

        {/* ==== PUBLIC ==== */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ==== TRAVELER ==== */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute allowedRoles={['TRAVELER', 'ADMIN']}>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/planner"
          element={
            <PrivateRoute allowedRoles={['TRAVELER']}>
              <Planner />
            </PrivateRoute>
          }
        />

        <Route
          path="/budget"
          element={
            <PrivateRoute allowedRoles={['TRAVELER']}>
              <BudgetPlanner />
            </PrivateRoute>
          }
        />

        <Route
          path="/chatbot"
          element={
            <PrivateRoute allowedRoles={['TRAVELER']}>
              <Chatbot />
            </PrivateRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute allowedRoles={['TRAVELER']}>
              <Profile />
            </PrivateRoute>
          }
        />

        <Route
          path="/emergency-contacts"
          element={
            <PrivateRoute allowedRoles={['TRAVELER']}>
              <EmergencyContactManager />
            </PrivateRoute>
          }
        />

        {/* ==== POLICE ==== */}
        <Route
          path="/police-dashboard"
          element={
            <PrivateRoute allowedRoles={['POLICE']}>
              <PoliceDashboard />
            </PrivateRoute>
          }
        />

        {/* ==== ADMIN ==== */}
        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/geofence"
          element={
            <PrivateRoute allowedRoles={['TRAVELER', 'ADMIN']}>
              <GeofenceMap />
            </PrivateRoute>
          }
        />

        {/* ==== SHARED ==== */}
        <Route
          path="/sos-log"
          element={
            <PrivateRoute allowedRoles={['POLICE', 'ADMIN']}>
              <SOSLog />
            </PrivateRoute>
          }
        />

        <Route
          path="/articles"
          element={
            <PrivateRoute allowedRoles={['TRAVELER', 'ADMIN']}>
              <Articles />
            </PrivateRoute>
          }
        />

        {/* DEFAULT */}
        <Route path="/" element={<Navigate to="/dashboard" />} />

      </Routes>
    </Router>
  );
}

export default App;
