import { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    phoneNumber: '',
    profileImageUrl: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/user/me');
      setUser(response.data);
      setFormData({
        fullName: response.data.fullName || '',
        bio: response.data.bio || '',
        phoneNumber: response.data.phoneNumber || '',
        profileImageUrl: response.data.profileImageUrl || '',
      });
    } catch (error) {
      showToast('Failed to fetch profile', 'error');
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.put('/user/profile', formData);
      setUser(response.data);
      setEditing(false);
      showToast('Profile updated successfully');
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // For now, just set the URL. In production, you'd upload to a server
        setFormData({ ...formData, profileImageUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user) {
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
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <h1>Profile</h1>

        {!editing ? (
          <div>
            <div style={{ marginBottom: '30px' }}>
              {user.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt="Profile"
                  style={{
                    width: '150px',
                    height: '150px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    marginBottom: '20px',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '150px',
                    height: '150px',
                    borderRadius: '50%',
                    backgroundColor: '#ddd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '50px',
                    marginBottom: '20px',
                  }}
                >
                  {(user.fullName || user.name)?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <h2>{user.fullName || user.name}</h2>
              <p>Email: {user.email}</p>
              <p>Phone: {user.phoneNumber || 'Not set'}</p>
              <p>Role: {user.role}</p>
              {user.bio && (
                <div style={{ marginTop: '20px' }}>
                  <h3>Bio</h3>
                  <p>{user.bio}</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setEditing(true)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Full Name:</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                style={{ width: '100%', padding: '8px' }}
                placeholder="Enter your full name"
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Profile Image URL:</label>
              <input
                type="text"
                value={formData.profileImageUrl}
                onChange={(e) => setFormData({ ...formData, profileImageUrl: e.target.value })}
                style={{ width: '100%', padding: '8px' }}
                placeholder="Enter image URL or upload"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ marginTop: '10px' }}
              />
              <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                Note: File upload converts to base64. For production, use a proper image upload service.
              </p>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Phone:</label>
              <input
                type="text"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Bio:</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                style={{ width: '100%', padding: '8px', minHeight: '100px' }}
                placeholder="Tell us about yourself..."
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  fetchProfile();
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Profile;

