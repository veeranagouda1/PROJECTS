import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../api/axios';
import Notifications from './Notifications';

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/user/me');
        setUser(response.data);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '15px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
        <Link
          to="/dashboard"
          style={{
            color: 'white',
            textDecoration: 'none',
            fontSize: '24px',
            fontWeight: 'bold',
            letterSpacing: '0.5px',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => e.target.style.textShadow = '0 2px 10px rgba(0,0,0,0.2)'}
          onMouseLeave={(e) => e.target.style.textShadow = 'none'}
        >
          ✈️ Travel Planner
        </Link>
        <Link
          to="/planner"
          style={{ 
            color: 'white', 
            textDecoration: 'none', 
            fontWeight: '500',
            transition: 'all 0.3s ease',
            opacity: 0.9,
          }}
          onMouseEnter={(e) => { e.target.style.opacity = '1'; e.target.style.textShadow = '0 2px 8px rgba(0,0,0,0.1)'; }}
          onMouseLeave={(e) => { e.target.style.opacity = '0.9'; e.target.style.textShadow = 'none'; }}
        >
          Planner
        </Link>
        <Link
          to="/budget"
          style={{ 
            color: 'white', 
            textDecoration: 'none',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            opacity: 0.9,
          }}
          onMouseEnter={(e) => { e.target.style.opacity = '1'; e.target.style.textShadow = '0 2px 8px rgba(0,0,0,0.1)'; }}
          onMouseLeave={(e) => { e.target.style.opacity = '0.9'; e.target.style.textShadow = 'none'; }}
        >
          Budget
        </Link>
        <Link
          to="/chatbot"
          style={{ 
            color: 'white', 
            textDecoration: 'none',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            opacity: 0.9,
          }}
          onMouseEnter={(e) => { e.target.style.opacity = '1'; e.target.style.textShadow = '0 2px 8px rgba(0,0,0,0.1)'; }}
          onMouseLeave={(e) => { e.target.style.opacity = '0.9'; e.target.style.textShadow = 'none'; }}
        >
          Chatbot
        </Link>
        <Link
          to="/geofence"
          style={{ 
            color: 'white', 
            textDecoration: 'none',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            opacity: 0.9,
          }}
          onMouseEnter={(e) => { e.target.style.opacity = '1'; e.target.style.textShadow = '0 2px 8px rgba(0,0,0,0.1)'; }}
          onMouseLeave={(e) => { e.target.style.opacity = '0.9'; e.target.style.textShadow = 'none'; }}
        >
          Safety Map
        </Link>
        <Link
          to="/articles"
          style={{ 
            color: 'white', 
            textDecoration: 'none',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            opacity: 0.9,
          }}
          onMouseEnter={(e) => { e.target.style.opacity = '1'; e.target.style.textShadow = '0 2px 8px rgba(0,0,0,0.1)'; }}
          onMouseLeave={(e) => { e.target.style.opacity = '0.9'; e.target.style.textShadow = 'none'; }}
        >
          Articles
        </Link>
        {user?.role === 'POLICE' && (
          <Link
            to="/police"
            style={{ 
              color: 'white', 
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'all 0.3s ease',
              opacity: 0.9,
            }}
            onMouseEnter={(e) => { e.target.style.opacity = '1'; e.target.style.textShadow = '0 2px 8px rgba(0,0,0,0.1)'; }}
            onMouseLeave={(e) => { e.target.style.opacity = '0.9'; e.target.style.textShadow = 'none'; }}
          >
            Police Dashboard
          </Link>
        )}
        {user?.role === 'ADMIN' && (
          <Link
            to="/admin"
            style={{ 
              color: 'white', 
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'all 0.3s ease',
              opacity: 0.9,
            }}
            onMouseEnter={(e) => { e.target.style.opacity = '1'; e.target.style.textShadow = '0 2px 8px rgba(0,0,0,0.1)'; }}
            onMouseLeave={(e) => { e.target.style.opacity = '0.9'; e.target.style.textShadow = 'none'; }}
          >
            Admin
          </Link>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Notifications />
        <Link
          to="/profile"
          style={{ 
            color: 'white', 
            textDecoration: 'none',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            opacity: 0.9,
            padding: '8px 15px',
            borderRadius: '8px',
          }}
          onMouseEnter={(e) => { e.target.style.opacity = '1'; e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'; }}
          onMouseLeave={(e) => { e.target.style.opacity = '0.9'; e.target.style.backgroundColor = 'transparent'; }}
        >
          👤 {user?.name || 'Profile'}
        </Link>
        <button
          onClick={handleLogout}
          style={{
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 18px rgba(255, 107, 107, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(255, 107, 107, 0.3)';
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

