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
    <div style={{ background: 'linear-gradient(135deg, #1a1f35 0%, #252d4a 100%)', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ color: '#ffffff', marginBottom: '30px', fontSize: '36px', fontWeight: '800' }}>🚨 SOS Event Log</h1>
        {sosEvents.length === 0 ? (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              padding: '40px',
              textAlign: 'center',
            }}
          >
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '16px' }}>No SOS events recorded</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {sosEvents.map((event) => (
              <div
                key={event.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  padding: '25px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                  e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.3)';
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(220, 38, 38, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px', fontWeight: '600', marginBottom: '10px' }}>
                      📍 <strong>Location:</strong>
                    </p>
                    <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginBottom: '15px' }}>
                      {event.latitude}, {event.longitude}
                    </p>
                    {event.address && (
                      <>
                        <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px', fontWeight: '600', marginBottom: '10px' }}>
                          🏠 <strong>Address:</strong>
                        </p>
                        <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginBottom: '15px' }}>
                          {event.address}
                        </p>
                      </>
                    )}
                    <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px', fontWeight: '600', marginBottom: '10px' }}>
                      🕐 <strong>Time:</strong>
                    </p>
                    <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginBottom: '15px' }}>
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${event.latitude},${event.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      color: 'white',
                      textDecoration: 'none',
                      display: 'inline-block',
                      padding: '12px 20px',
                      borderRadius: '10px',
                      fontWeight: '600',
                      fontSize: '14px',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      boxShadow: '0 5px 15px rgba(245, 87, 108, 0.3)',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 20px rgba(245, 87, 108, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 5px 15px rgba(245, 87, 108, 0.3)';
                    }}
                  >
                    View on Map →
                  </a>
                </div>
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

