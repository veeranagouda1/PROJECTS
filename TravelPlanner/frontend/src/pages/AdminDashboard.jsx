import { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [sosEvents, setSosEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchUsers();
      fetchRecentSOS();
    }
  }, [user]);

  const fetchUser = async () => {
    try {
      const response = await api.get('/user/me');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      showToast('Failed to fetch users', 'error');
    }
  };

  const fetchRecentSOS = async () => {
    try {
      const response = await api.get('/admin/sos/recent');
      setSosEvents(response.data);
    } catch (error) {
      showToast('Failed to fetch SOS events', 'error');
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    setLoading(true);
    try {
      await api.delete(`/admin/user/${id}`);
      showToast('User deleted successfully');
      fetchUsers();
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to delete user', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div>
        <Navbar />
        <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
      </div>
    );
  }

  if (user.role !== 'ADMIN') {
    return (
      <div>
        <Navbar />
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Access Denied</h1>
          <p>You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div style={{ padding: '20px' }}>
        <h1>Admin Dashboard</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px' }}>
          <div>
            <h2>All Users</h2>
            {users.length === 0 ? (
              <p>No users found</p>
            ) : (
              <div>
                {users.map((u) => (
                  <div
                    key={u.id}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      padding: '15px',
                      marginBottom: '15px',
                    }}
                  >
                    <h3>{u.name}</h3>
                    <p>Email: {u.email}</p>
                    <p>Phone: {u.phone || 'Not set'}</p>
                    <p>Role: {u.role}</p>
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      disabled={loading}
                      style={{
                        marginTop: '10px',
                        padding: '5px 10px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Delete User
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2>Recent SOS Events</h2>
            {sosEvents.length === 0 ? (
              <p>No SOS events</p>
            ) : (
              <div>
                {sosEvents.map((event) => (
                  <div
                    key={event.id}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      padding: '15px',
                      marginBottom: '15px',
                    }}
                  >
                    <p>
                      <strong>User ID:</strong> {event.userId}
                    </p>
                    <p>
                      <strong>Location:</strong> {event.latitude}, {event.longitude}
                    </p>
                    {event.address && (
                      <p>
                        <strong>Address:</strong> {event.address}
                      </p>
                    )}
                    <p>
                      <strong>Time:</strong> {new Date(event.timestamp).toLocaleString()}
                    </p>
                    <a
                      href={`https://www.google.com/maps?q=${event.latitude},${event.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#007bff', textDecoration: 'none' }}
                    >
                      View on Map
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default AdminDashboard;

