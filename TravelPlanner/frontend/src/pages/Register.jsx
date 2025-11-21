import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { safeStorage, storageKeys } from '../utils/storage';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'TRAVELER',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/register', {
        fullName: formData.username,
        email: formData.email,
        password: formData.password,
        phoneNumber: "",
        role: formData.role,
      });
      
      const { token, email, userId } = response.data;
      
      if (!token) {
        setError("No token received from server");
        return;
      }

      safeStorage.clearNonEssentialData();

      const userIdString = userId ? String(userId) : "";
      const emailString = email ? String(email) : "";

      if (!safeStorage.setItem(storageKeys.TOKEN, token)) {
        setError("Failed to save session. Please try again.");
        return;
      }

      safeStorage.setItem(storageKeys.ROLE, formData.role);
      safeStorage.setItem(storageKeys.USER_ID, userIdString);
      safeStorage.setItem(storageKeys.USER_EMAIL, emailString);

      if (formData.role === "ADMIN") {
        navigate("/admin");
      } else if (formData.role === "POLICE") {
        navigate("/police-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      const errorMessage = 
        err.response?.data?.message || 
        err.response?.data?.error ||
        (err.response?.status === 400 ? "Email already exists or invalid data" : 'Registration failed');
      setError(errorMessage);
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a1f35 0%, #252d4a 50%, #1d2d40 100%)',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(76, 175, 254, 0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(120, 100, 255, 0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
      
      <div style={{
        maxWidth: '450px',
        width: '100%',
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        zIndex: 10,
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#ffffff', fontSize: '36px', marginBottom: '10px', fontWeight: '800' }}>✨ Join Us</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px' }}>Create your Travel Planner account today</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>👤 Full Name</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="John Doe"
              style={{ 
                width: '100%', 
                padding: '12px 15px', 
                fontSize: '16px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '10px',
                color: '#ffffff',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(76, 175, 254, 0.5)';
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.boxShadow = '0 0 0 3px rgba(76, 175, 254, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>📧 Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              style={{ 
                width: '100%', 
                padding: '12px 15px', 
                fontSize: '16px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '10px',
                color: '#ffffff',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(76, 175, 254, 0.5)';
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.boxShadow = '0 0 0 3px rgba(76, 175, 254, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>🔐 Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              style={{ 
                width: '100%', 
                padding: '12px 15px', 
                fontSize: '16px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '10px',
                color: '#ffffff',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(76, 175, 254, 0.5)';
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.boxShadow = '0 0 0 3px rgba(76, 175, 254, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>✓ Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="••••••••"
              style={{ 
                width: '100%', 
                padding: '12px 15px', 
                fontSize: '16px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '10px',
                color: '#ffffff',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(76, 175, 254, 0.5)';
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.boxShadow = '0 0 0 3px rgba(76, 175, 254, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>👤 Select Your Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              style={{ 
                width: '100%', 
                padding: '12px 15px', 
                fontSize: '16px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '10px',
                color: '#ffffff',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(76, 175, 254, 0.5)';
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.boxShadow = '0 0 0 3px rgba(76, 175, 254, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option style={{ backgroundColor: '#1a1f4a', color: '#ffffff' }} value="TRAVELER">🧳 Traveler</option>
              <option style={{ backgroundColor: '#1a1f4a', color: '#ffffff' }} value="POLICE">🚔 Police Officer</option>
              <option style={{ backgroundColor: '#1a1f4a', color: '#ffffff' }} value="ADMIN">⚙️ Admin</option>
            </select>
          </div>
          
          {error && (
            <div style={{ 
              background: 'rgba(220, 38, 38, 0.15)',
              color: '#ff6b6b',
              padding: '12px 15px',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid rgba(220, 38, 38, 0.3)',
              fontSize: '14px',
            }}>
              ⚠️ {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              fontWeight: '700',
              background: loading ? 'rgba(76, 175, 254, 0.3)' : 'linear-gradient(135deg, #4caffe 0%, #4f46e5 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: loading ? 'none' : '0 10px 30px rgba(76, 175, 254, 0.3)',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 15px 40px rgba(76, 175, 254, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 10px 30px rgba(76, 175, 254, 0.3)';
              }
            }}
          >
            {loading ? '🔄 Registering...' : '✨ Create Account'}
          </button>
        </form>
        
        <div style={{ marginTop: '25px', textAlign: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.2)', paddingTop: '20px' }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#4caffe', fontWeight: '600', textDecoration: 'none', transition: 'all 0.2s ease' }} onMouseEnter={(e) => (e.target.style.textDecoration = 'underline', e.target.style.color = '#6fc3ff')} onMouseLeave={(e) => (e.target.style.textDecoration = 'none', e.target.style.color = '#4caffe')}>
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

