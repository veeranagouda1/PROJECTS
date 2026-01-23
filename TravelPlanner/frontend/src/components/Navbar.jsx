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
    color: 'white',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    opacity: 0.9,
    padding: '6px 10px',
    borderRadius: '6px',
  };

  const menuHover = (e) => {
    e.target.style.opacity = '1';
    e.target.style.textShadow = '0 2px 8px rgba(0,0,0,0.2)';
    e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
  };

  const menuOut = (e) => {
    e.target.style.opacity = '0.9';
    e.target.style.textShadow = 'none';
    e.target.style.backgroundColor = 'transparent';
  };

  return (
    <nav
      style={{
        background: isDark
          ? 'rgba(10, 10, 25, 0.7)'
          : 'linear-gradient(135deg, #4C2AFF 0%, #8B5DFF 100%)',
        padding: '15px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: '30px',
        boxShadow: isDark
          ? '0 4px 20px rgba(0,0,0,0.5)'
          : '0 4px 20px rgba(76, 42, 255, 0.3)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: isDark
          ? '1px solid rgba(255,255,255,0.05)'
          : '1px solid rgba(255, 255, 255, 0.2)',
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

        <Link to="/geofence" style={menuItemStyle} onMouseEnter={menuHover} onMouseLeave={menuOut}>
          Safety Map
        </Link>

        <Link to="/articles" style={menuItemStyle} onMouseEnter={menuHover} onMouseLeave={menuOut}>
          Articles
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
            background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255, 255, 255, 0.25)',
            border: 'none',
            borderRadius: '50%',
            width: '42px',
            height: '42px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '20px',
            transition: 'all 0.3s ease',
            color: 'white',
          }}
          onMouseEnter={(e) => (e.target.style.transform = 'scale(1.1)')}
          onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
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
            backgroundColor: 'rgba(255,255,255,0.15)',
          }}
          onMouseEnter={menuHover}
          onMouseLeave={menuOut}
        >
          👤 {user?.fullName || 'Profile'}
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
