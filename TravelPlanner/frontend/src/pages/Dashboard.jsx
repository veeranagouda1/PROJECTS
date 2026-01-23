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
    <div>
      <Navbar />
      <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{ color: '#000000', marginBottom: '30px' }}>Welcome to Your Dashboard</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px', marginBottom: '40px' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              padding: '25px',
              color: 'white',
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.2)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.2)'; }}
          >
            <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '10px' }}>Upcoming Trips</p>
            <p style={{ fontSize: '40px', fontWeight: 'bold', margin: '0' }}>{upcomingTrips.length}</p>
          </div>
          <div
            style={{
              background: 'linear-gradient(135deg, #00d2fc 0%, #3a47d5 100%)',
              borderRadius: '12px',
              padding: '25px',
              color: 'white',
              boxShadow: '0 8px 25px rgba(0, 210, 252, 0.2)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 12px 35px rgba(0, 210, 252, 0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 210, 252, 0.2)'; }}
          >
            <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '10px' }}>Total Budget</p>
            <p style={{ fontSize: '40px', fontWeight: 'bold', margin: '0' }}>${totalBudget.toFixed(2)}</p>
          </div>
          <div
            style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              borderRadius: '12px',
              padding: '25px',
              color: 'white',
              boxShadow: '0 8px 25px rgba(245, 87, 108, 0.2)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 12px 35px rgba(245, 87, 108, 0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(245, 87, 108, 0.2)'; }}
          >
            <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '10px' }}>Total Spent</p>
            <p style={{ fontSize: '40px', fontWeight: 'bold', margin: '0' }}>${totalSpent.toFixed(2)}</p>
          </div>
          <div
            style={{
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              borderRadius: '12px',
              padding: '25px',
              color: 'white',
              boxShadow: '0 8px 25px rgba(250, 112, 154, 0.2)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 12px 35px rgba(250, 112, 154, 0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(250, 112, 154, 0.2)'; }}
          >
            <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '10px' }}>Recent SOS Events</p>
            <p style={{ fontSize: '40px', fontWeight: 'bold', margin: '0' }}>{sosEvents.length}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)', transition: 'all 0.3s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.12)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            <h2 style={{ color: '#000000', marginTop: '0' }}>📅 Upcoming Trips</h2>
            {upcomingTrips.length === 0 ? (
              <p style={{ color: '#000000' }}>No upcoming trips. <Link to="/planner">Plan one now!</Link></p>
            ) : (
              <div>
                {upcomingTrips.map((trip) => (
                  <div
                    key={trip.id}
                    style={{
                      borderLeft: '4px solid #667eea',
                      borderRadius: '8px',
                      padding: '15px',
                      marginBottom: '15px',
                      backgroundColor: '#f9f9f9',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f0f4f8'; e.currentTarget.style.transform = 'translateX(5px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f9f9f9'; e.currentTarget.style.transform = 'translateX(0)'; }}
                  >
                    <h3 style={{ color: '#000000', margin: '0 0 8px 0' }}>{trip.destination}</h3>
                    <p style={{ color: '#000000', margin: '5px 0' }}>
                      📍 {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                    </p>
                    {trip.budget && <p style={{ color: '#667eea', fontWeight: '600', margin: '5px 0' }}>💰 Budget: ${trip.budget}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ background: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)', transition: 'all 0.3s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.12)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            <h2 style={{ color: '#000000', marginTop: '0' }}>🆘 Recent SOS Events</h2>
            {sosEvents.length === 0 ? (
              <p style={{ color: '#000000' }}>No recent SOS events</p>
            ) : (
              <div>
                {sosEvents.map((event) => (
                  <div
                    key={event.id}
                    style={{
                      borderLeft: '4px solid #f5576c',
                      borderRadius: '8px',
                      padding: '15px',
                      marginBottom: '15px',
                      backgroundColor: '#fff5f5',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fff0f0'; e.currentTarget.style.transform = 'translateX(5px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff5f5'; e.currentTarget.style.transform = 'translateX(0)'; }}
                  >
                    <p style={{ color: '#000000', margin: '5px 0' }}>
                      <strong>📍 Location:</strong> {event.latitude}, {event.longitude}
                    </p>
                    <p style={{ color: '#f5576c', fontWeight: '600', margin: '5px 0' }}>
                      <strong>⏰ Time:</strong> {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)', marginBottom: '40px' }}>
          <h2 style={{ color: '#000000', marginTop: '0' }}>⚡ Quick Links</h2>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <Link
              to="/planner"
              style={{
                padding: '12px 25px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(102, 126, 234, 0.4)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)'; }}
            >
              ✈️ Trip Planner
            </Link>
            <Link
              to="/budget"
              style={{
                padding: '12px 25px',
                background: 'linear-gradient(135deg, #00d2fc 0%, #3a47d5 100%)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(0, 210, 252, 0.3)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(0, 210, 252, 0.4)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 210, 252, 0.3)'; }}
            >
              💰 Budget Planner
            </Link>
            <Link
              to="/chatbot"
              style={{
                padding: '12px 25px',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(245, 87, 108, 0.3)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(245, 87, 108, 0.4)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 87, 108, 0.3)'; }}
            >
              🤖 AI Chatbot
            </Link>
            <Link
              to="/profile"
              style={{
                padding: '12px 25px',
                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(17, 153, 142, 0.3)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(17, 153, 142, 0.4)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(17, 153, 142, 0.3)'; }}
            >
              👤 Profile
            </Link>
            <Link
              to="/sos-log"
              style={{
                padding: '12px 25px',
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                color: '#000000',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(250, 112, 154, 0.3)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(250, 112, 154, 0.4)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(250, 112, 154, 0.3)'; }}
            >
              📋 SOS Log
            </Link>
            <Link
              to="/geofence"
              style={{
                padding: '12px 25px',
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(255, 107, 107, 0.4)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 107, 107, 0.3)'; }}
            >
              🗺️ Safety Map
            </Link>
            <Link
              to="/articles"
              style={{
                padding: '12px 25px',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(79, 172, 254, 0.3)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(79, 172, 254, 0.4)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(79, 172, 254, 0.3)'; }}
            >
              📰 Articles
            </Link>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)' }}>
          <h2 style={{ color: '#000000', marginTop: '0' }}>🆘 Emergency SOS</h2>
          <SOSButtonEnhanced onSuccess={(msg, type) => showToast(msg, type)} />
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Dashboard;
