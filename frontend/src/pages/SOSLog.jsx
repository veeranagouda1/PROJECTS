import { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';

const SOSLog = () => {
  const [sosEvents, setSosEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchSOSEvents();
  }, []);

  const fetchSOSEvents = async () => {
    try {
      const response = await api.get('/sos/user');
      setSosEvents(response.data);
    } catch (error) {
      showToast('Failed to fetch SOS events', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div style={{ padding: '20px' }}>
        <h1>SOS Event Log</h1>
        {sosEvents.length === 0 ? (
          <p>No SOS events recorded</p>
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
                  style={{
                    color: '#007bff',
                    textDecoration: 'none',
                    display: 'inline-block',
                    marginTop: '10px',
                  }}
                >
                  View on Map →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default SOSLog;

