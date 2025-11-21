import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import SOSButtonEnhanced from '../components/SOSButtonEnhanced';
import Toast from '../components/Toast';

const Dashboard = () => {
  const [trips, setTrips] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [sosEvents, setSosEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tripsRes, budgetsRes, sosRes] = await Promise.all([
        api.get('/trips/user'),
        api.get('/budget/user'),
        api.get('/sos/user'),
      ]);
      setTrips(tripsRes.data);
      setBudgets(budgetsRes.data);
      setSosEvents(sosRes.data.slice(0, 3));
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const upcomingTrips = trips
    .filter((trip) => new Date(trip.startDate) >= new Date())
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .slice(0, 3);

  const totalSpent = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalBudget = trips.reduce((sum, trip) => sum + (trip.budget || 0), 0);

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ background: 'linear-gradient(135deg, #0C0E16 0%, #161A27 100%)', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{ color: '#F5F7FF', marginBottom: '30px', fontSize: '36px', fontWeight: '800' }}>✨ Welcome to Your Dashboard</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px', marginBottom: '40px' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #7B2FFF 0%, #C74BFF 100%)',
              borderRadius: '12px',
              padding: '25px',
              color: '#F5F7FF',
              boxShadow: '0 0 20px rgba(123, 47, 255, 0.4), 0 8px 25px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(123, 47, 255, 0.6), 0 12px 35px rgba(0, 0, 0, 0.4)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(123, 47, 255, 0.4), 0 8px 25px rgba(0, 0, 0, 0.3)'; }}
          >
            <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '10px' }}>Upcoming Trips</p>
            <p style={{ fontSize: '40px', fontWeight: 'bold', margin: '0' }}>{upcomingTrips.length}</p>
          </div>
          <div
            style={{
              background: 'linear-gradient(135deg, #005CFF 0%, #00D2FF 100%)',
              borderRadius: '12px',
              padding: '25px',
              color: '#F5F7FF',
              boxShadow: '0 0 20px rgba(0, 92, 255, 0.4), 0 8px 25px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 210, 255, 0.6), 0 12px 35px rgba(0, 0, 0, 0.4)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 92, 255, 0.4), 0 8px 25px rgba(0, 0, 0, 0.3)'; }}
          >
            <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '10px' }}>Total Budget</p>
            <p style={{ fontSize: '40px', fontWeight: 'bold', margin: '0' }}>${totalBudget.toFixed(2)}</p>
          </div>
          <div
            style={{
              background: 'linear-gradient(135deg, #FF4E88 0%, #FF6F61 100%)',
              borderRadius: '12px',
              padding: '25px',
              color: '#F5F7FF',
              boxShadow: '0 0 20px rgba(255, 78, 136, 0.4), 0 8px 25px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 78, 136, 0.6), 0 12px 35px rgba(0, 0, 0, 0.4)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 78, 136, 0.4), 0 8px 25px rgba(0, 0, 0, 0.3)'; }}
          >
            <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '10px' }}>Total Spent</p>
            <p style={{ fontSize: '40px', fontWeight: 'bold', margin: '0' }}>${totalSpent.toFixed(2)}</p>
          </div>
          <div
            style={{
              background: 'linear-gradient(135deg, #FDB813 0%, #FF8A3D 100%)',
              borderRadius: '12px',
              padding: '25px',
              color: '#F5F7FF',
              boxShadow: '0 0 20px rgba(253, 184, 19, 0.4), 0 8px 25px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(253, 184, 19, 0.6), 0 12px 35px rgba(0, 0, 0, 0.4)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(253, 184, 19, 0.4), 0 8px 25px rgba(0, 0, 0, 0.3)'; }}
          >
            <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '10px' }}>Recent SOS Events</p>
            <p style={{ fontSize: '40px', fontWeight: 'bold', margin: '0' }}>{sosEvents.length}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
          <div style={{ background: '#161A27', backdropFilter: 'blur(10px)', border: '1px solid rgba(123, 47, 255, 0.15)', borderRadius: '16px', padding: '25px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(123, 47, 255, 0.1)', transition: 'all 0.3s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 210, 255, 0.3), inset 0 1px 1px rgba(123, 47, 255, 0.1)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'rgba(0, 210, 255, 0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(123, 47, 255, 0.1)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(123, 47, 255, 0.15)'; }}>
            <h2 style={{ color: '#F5F7FF', marginTop: '0' }}>📅 Upcoming Trips</h2>
            {upcomingTrips.length === 0 ? (
              <p style={{ color: '#B4B9CC' }}>No upcoming trips. <Link to="/planner" style={{ color: '#00D2FF', textDecoration: 'none', fontWeight: '600' }}>Plan one now!</Link></p>
            ) : (
              <div>
                {upcomingTrips.map((trip) => (
                  <div
                    key={trip.id}
                    style={{
                      borderLeft: '4px solid #00D2FF',
                      borderRadius: '8px',
                      padding: '15px',
                      marginBottom: '15px',
                      backgroundColor: 'rgba(0, 210, 255, 0.1)',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0, 210, 255, 0.15)'; e.currentTarget.style.transform = 'translateX(5px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0, 210, 255, 0.1)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                  >
                    <h3 style={{ color: '#F5F7FF', margin: '0 0 8px 0' }}>{trip.destination}</h3>
                    <p style={{ color: '#B4B9CC', margin: '5px 0' }}>
                      📍 {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                    </p>
                    {trip.budget && <p style={{ color: '#00D2FF', fontWeight: '600', margin: '5px 0' }}>💰 Budget: ${trip.budget}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ background: '#161A27', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 78, 136, 0.15)', borderRadius: '16px', padding: '25px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 78, 136, 0.1)', transition: 'all 0.3s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(255, 78, 136, 0.3), inset 0 1px 1px rgba(255, 78, 136, 0.1)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'rgba(255, 78, 136, 0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 78, 136, 0.1)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255, 78, 136, 0.15)'; }}>
            <h2 style={{ color: '#F5F7FF', marginTop: '0' }}>🆘 Recent SOS Events</h2>
            {sosEvents.length === 0 ? (
              <p style={{ color: '#B4B9CC' }}>No recent SOS events</p>
            ) : (
              <div>
                {sosEvents.map((event) => (
                  <div
                    key={event.id}
                    style={{
                      borderLeft: '4px solid #FF4E88',
                      borderRadius: '8px',
                      padding: '15px',
                      marginBottom: '15px',
                      backgroundColor: 'rgba(255, 78, 136, 0.1)',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 78, 136, 0.15)'; e.currentTarget.style.transform = 'translateX(5px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 78, 136, 0.1)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                  >
                    <p style={{ color: '#B4B9CC', margin: '5px 0' }}>
                      <strong>📍 Location:</strong> {event.latitude}, {event.longitude}
                    </p>
                    <p style={{ color: '#FF4E88', fontWeight: '600', margin: '5px 0' }}>
                      <strong>⏰ Time:</strong> {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ background: '#161A27', backdropFilter: 'blur(10px)', border: '1px solid rgba(123, 47, 255, 0.15)', borderRadius: '16px', padding: '30px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(123, 47, 255, 0.1)', marginBottom: '40px' }}>
          <h2 style={{ color: '#F5F7FF', marginTop: '0' }}>⚡ Quick Links</h2>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <Link
              to="/planner"
              style={{
                padding: '12px 25px',
                background: 'linear-gradient(135deg, #7B2FFF 0%, #C74BFF 100%)',
                color: '#F5F7FF',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: '0 0 15px rgba(123, 47, 255, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 0 25px rgba(123, 47, 255, 0.6), 0 6px 18px rgba(0, 0, 0, 0.4)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(123, 47, 255, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)'; }}
            >
              ✈️ Trip Planner
            </Link>
            <Link
              to="/budget"
              style={{
                padding: '12px 25px',
                background: 'linear-gradient(135deg, #005CFF 0%, #00D2FF 100%)',
                color: '#F5F7FF',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: '0 0 15px rgba(0, 92, 255, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 210, 255, 0.6), 0 6px 18px rgba(0, 0, 0, 0.4)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 92, 255, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)'; }}
            >
              💰 Budget Planner
            </Link>
            <Link
              to="/chatbot"
              style={{
                padding: '12px 25px',
                background: 'linear-gradient(135deg, #FF4E88 0%, #FF6F61 100%)',
                color: '#F5F7FF',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: '0 0 15px rgba(255, 78, 136, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 0 25px rgba(255, 78, 136, 0.6), 0 6px 18px rgba(0, 0, 0, 0.4)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 78, 136, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)'; }}
            >
              🤖 AI Chatbot
            </Link>
            <Link
              to="/profile"
              style={{
                padding: '12px 25px',
                background: 'linear-gradient(135deg, #FDB813 0%, #FF8A3D 100%)',
                color: '#F5F7FF',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: '0 0 15px rgba(253, 184, 19, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 0 25px rgba(253, 184, 19, 0.6), 0 6px 18px rgba(0, 0, 0, 0.4)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(253, 184, 19, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)'; }}
            >
              👤 Profile
            </Link>
            <Link
              to="/sos-log"
              style={{
                padding: '12px 25px',
                background: 'linear-gradient(135deg, #FF4E88 0%, #FF6F61 100%)',
                color: '#F5F7FF',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: '0 0 15px rgba(255, 78, 136, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 0 25px rgba(255, 78, 136, 0.6), 0 6px 18px rgba(0, 0, 0, 0.4)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 78, 136, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)'; }}
            >
              📋 SOS Log
            </Link>
            <Link
              to="/safety-map"
              style={{
                padding: '12px 25px',
                background: 'linear-gradient(135deg, #005CFF 0%, #00D2FF 100%)',
                color: '#F5F7FF',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: '0 0 15px rgba(0, 92, 255, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 210, 255, 0.6), 0 6px 18px rgba(0, 0, 0, 0.4)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 92, 255, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)'; }}
            >
              🗺️ Safety Map
            </Link>
            <Link
              to="/articles"
              style={{
                padding: '12px 25px',
                background: 'linear-gradient(135deg, #FDB813 0%, #FF8A3D 100%)',
                color: '#F5F7FF',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: '0 0 15px rgba(253, 184, 19, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 0 25px rgba(253, 184, 19, 0.6), 0 6px 18px rgba(0, 0, 0, 0.4)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(253, 184, 19, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)'; }}
            >
              📰 Articles
            </Link>
          </div>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '16px', padding: '30px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)' }}>
          <h2 style={{ color: '#ffffff', marginTop: '0' }}>🆘 Emergency SOS</h2>
          <SOSButtonEnhanced onSuccess={(msg, type) => showToast(msg, type)} />
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Dashboard;
