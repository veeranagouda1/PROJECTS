import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../api/axios';
import Notifications from './Notifications';
import { useTheme } from '../contexts/ThemeContext';
import { safeStorage, storageKeys } from '../utils/storage';

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const { isDark, toggleTheme } = useTheme();

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
    safeStorage.removeItem(storageKeys.TOKEN);
    safeStorage.removeItem(storageKeys.ROLE);
    safeStorage.removeItem(storageKeys.USER_ID);
    safeStorage.removeItem(storageKeys.USER_EMAIL);
    navigate('/login');
  };

  const menuItemStyle = {
    color: '#F5F7FF',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    opacity: 0.85,
    padding: '6px 10px',
    borderRadius: '6px',
  };

  const menuHover = (e) => {
    e.target.style.opacity = '1';
    e.target.style.textShadow = '0 0 10px rgba(123, 47, 255, 0.6)';
    e.target.style.backgroundColor = 'rgba(123, 47, 255, 0.2)';
  };

  const menuOut = (e) => {
    e.target.style.opacity = '0.85';
    e.target.style.textShadow = 'none';
    e.target.style.backgroundColor = 'transparent';
  };

  return (
    <nav
      style={{
        background: 'linear-gradient(135deg, rgba(123, 47, 255, 0.15) 0%, rgba(0, 210, 255, 0.1) 100%)',
        padding: '15px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: '30px',
        boxShadow: '0 0 30px rgba(123, 47, 255, 0.4), 0 4px 20px rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '2px solid rgba(123, 47, 255, 0.3)',
        borderRadius: '0 0 15px 15px',
        transition: '0.3s ease-in-out',
      }}
    >
      {/* LEFT MENU */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '25px',
          flexWrap: 'wrap',
        }}
      >
        <Link
          to="/dashboard"
          style={{
            ...menuItemStyle,
            fontSize: '24px',
            fontWeight: 'bold',
            letterSpacing: '0.5px',
          }}
          onMouseEnter={menuHover}
          onMouseLeave={menuOut}
        >
          ✈️ Travel Planner
        </Link>

        <Link to="/planner" style={menuItemStyle} onMouseEnter={menuHover} onMouseLeave={menuOut}>
          Planner
        </Link>

        <Link to="/budget" style={menuItemStyle} onMouseEnter={menuHover} onMouseLeave={menuOut}>
          Budget
        </Link>

        <Link to="/chatbot" style={menuItemStyle} onMouseEnter={menuHover} onMouseLeave={menuOut}>
          Chatbot
        </Link>

        <Link to="/safety-map" style={menuItemStyle} onMouseEnter={menuHover} onMouseLeave={menuOut}>
          🗺️ Safety Map
        </Link>

        <Link to="/articles" style={menuItemStyle} onMouseEnter={menuHover} onMouseLeave={menuOut}>
          📰 Articles
        </Link>

        {/* ⭐ NEW — EMERGENCY CONTACTS */}
        <Link
          to="/emergency-contacts"
          style={{ ...menuItemStyle, fontWeight: '600' }}
          onMouseEnter={menuHover}
          onMouseLeave={menuOut}
        >
          📞 Emergency Contacts
        </Link>

        {/* POLICE ROLE */}
        {user?.role === 'POLICE' && (
          <Link
            to="/police-dashboard"
            style={menuItemStyle}
            onMouseEnter={menuHover}
            onMouseLeave={menuOut}
          >
            Police Dashboard
          </Link>
        )}

        {/* ADMIN ROLE */}
        {user?.role === 'ADMIN' && (
          <Link
            to="/admin"
            style={menuItemStyle}
            onMouseEnter={menuHover}
            onMouseLeave={menuOut}
          >
            Admin
          </Link>
        )}
      </div>

      {/* RIGHT MENU */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '10px' }}>
        {/* Dark Mode Button */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'rgba(123, 47, 255, 0.2)',
            border: '1px solid rgba(123, 47, 255, 0.4)',
            borderRadius: '50%',
            width: '42px',
            height: '42px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '20px',
            transition: 'all 0.3s ease',
            color: '#F5F7FF',
            boxShadow: '0 0 15px rgba(123, 47, 255, 0.2)',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.1)';
            e.target.style.boxShadow = '0 0 25px rgba(123, 47, 255, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 0 15px rgba(123, 47, 255, 0.2)';
          }}
          title={isDark ? 'Light Mode' : 'Dark Mode'}
        >
          {isDark ? '☀️' : '🌙'}
        </button>

        <Notifications />

        <Link
          to="/profile"
          style={{
            ...menuItemStyle,
            padding: '8px 15px',
            borderRadius: '8px',
            backgroundColor: 'rgba(123, 47, 255, 0.15)',
            border: '1px solid rgba(123, 47, 255, 0.2)',
          }}
          onMouseEnter={menuHover}
          onMouseLeave={menuOut}
        >
          👤 {user?.fullName || 'Profile'}
        </Link>

        <button
          onClick={handleLogout}
          style={{
            background: 'linear-gradient(135deg, #FF4E88 0%, #FF6F61 100%)',
            color: '#F5F7FF',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            boxShadow: '0 0 15px rgba(255, 78, 136, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 0 25px rgba(255, 78, 136, 0.6), 0 6px 18px rgba(0, 0, 0, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 0 15px rgba(255, 78, 136, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)';
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
