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
      background: 'linear-gradient(135deg, #f5f7fa 0%, #f0f4f8 100%)',
      padding: '20px',
    }}>
      <div style={{
        maxWidth: '450px',
        width: '100%',
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 10px 40px rgba(102, 126, 234, 0.2)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#000000', fontSize: '32px', marginBottom: '10px' }}>✈️ Join Us</h1>
          <p style={{ color: '#666666', fontSize: '16px' }}>Create your Travel Planner account today</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#000000', fontWeight: '600' }}>👤 Full Name</label>
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
                border: '2px solid #e0e0e0',
                borderRadius: '10px',
                color: '#000000',
                backgroundColor: '#f9f9f9',
                transition: 'all 0.3s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.backgroundColor = 'white';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.backgroundColor = '#f9f9f9';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#000000', fontWeight: '600' }}>📧 Email Address</label>
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
                border: '2px solid #e0e0e0',
                borderRadius: '10px',
                color: '#000000',
                backgroundColor: '#f9f9f9',
                transition: 'all 0.3s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.backgroundColor = 'white';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.backgroundColor = '#f9f9f9';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#000000', fontWeight: '600' }}>🔐 Password</label>
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
                border: '2px solid #e0e0e0',
                borderRadius: '10px',
                color: '#000000',
                backgroundColor: '#f9f9f9',
                transition: 'all 0.3s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.backgroundColor = 'white';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.backgroundColor = '#f9f9f9';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#000000', fontWeight: '600' }}>✓ Confirm Password</label>
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
                border: '2px solid #e0e0e0',
                borderRadius: '10px',
                color: '#000000',
                backgroundColor: '#f9f9f9',
                transition: 'all 0.3s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.backgroundColor = 'white';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.backgroundColor = '#f9f9f9';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#000000', fontWeight: '600' }}>👤 Select Your Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              style={{ 
                width: '100%', 
                padding: '12px 15px', 
                fontSize: '16px',
                border: '2px solid #e0e0e0',
                borderRadius: '10px',
                color: '#000000',
                backgroundColor: '#f9f9f9',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.backgroundColor = 'white';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.backgroundColor = '#f9f9f9';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="TRAVELER">🧳 Traveler</option>
              <option value="POLICE">🚔 Police Officer</option>
              <option value="ADMIN">⚙️ Admin</option>
            </select>
          </div>
          
          {error && (
            <div style={{ 
              background: '#fff5f5',
              color: '#c53030',
              padding: '12px 15px',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid #feb2b2',
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
              fontWeight: '600',
              background: loading ? '#ccc' : 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(17, 153, 142, 0.3)',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(17, 153, 142, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(17, 153, 142, 0.3)';
              }
            }}
          >
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </form>
        
        <div style={{ marginTop: '25px', textAlign: 'center', borderTop: '1px solid #e0e0e0', paddingTop: '20px' }}>
          <p style={{ color: '#000000', margin: '0' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#667eea', fontWeight: '600', textDecoration: 'none' }}>
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

