import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
      const { token } = response.data;
      
      if (token) {
        localStorage.setItem('token', token);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
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
          <h1 style={{ color: '#000000', fontSize: '32px', marginBottom: '10px' }}>✈️ Welcome Back</h1>
          <p style={{ color: '#666666', fontSize: '16px' }}>Login to your Travel Planner account</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
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
          
          <div style={{ marginBottom: '25px' }}>
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
              background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
              }
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div style={{ marginTop: '25px', textAlign: 'center', borderTop: '1px solid #e0e0e0', paddingTop: '20px' }}>
          <p style={{ color: '#000000', margin: '0' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#667eea', fontWeight: '600', textDecoration: 'none' }}>
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

