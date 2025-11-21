import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { safeStorage, storageKeys } from '../utils/storage';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    const role = searchParams.get('role');
    const userId = searchParams.get('userId');
    const error = searchParams.get('error');

    if (error) {
      navigate('/login?error=oauth_failed');
      return;
    }

    if (token && email) {
      safeStorage.clearNonEssentialData();
      safeStorage.setItem(storageKeys.TOKEN, token);
      safeStorage.setItem(storageKeys.USER_EMAIL, email);
      safeStorage.setItem(storageKeys.ROLE, role || 'TRAVELER');
      safeStorage.setItem(storageKeys.USER_ID, userId || '');

      if (role === 'ADMIN') {
        navigate('/admin');
      } else if (role === 'POLICE') {
        navigate('/police-dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a1f35 0%, #252d4a 100%)',
    }}>
      <div style={{ color: 'white', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔄</div>
        <h2>Authenticating with Google...</h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Please wait while we complete your login</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
