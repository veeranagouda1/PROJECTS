import { useState } from 'react';
import api from '../api/axios';

const SOSButton = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [address, setAddress] = useState('');

  const handleSOS = () => {
    if (!navigator.geolocation) {
      setManualMode(true);
      setShowModal(true);
      return;
    }

    setShowModal(true);
  };

  const confirmSOS = () => {
    setLoading(true);

    const sendSOS = (lat, lng, addr) => {
      api.post('/sos', {
        latitude: lat,
        longitude: lng,
        message: addr || 'Emergency SOS request',
      })
        .then((response) => {
          if (onSuccess) onSuccess('SOS request sent successfully!');
          setShowModal(false);
          setManualMode(false);
          setLatitude('');
          setLongitude('');
          setAddress('');
        })
        .catch((error) => {
          if (onSuccess) onSuccess(error.response?.data?.error || 'Failed to send SOS request', 'error');
        })
        .finally(() => {
          setLoading(false);
        });
    };

    if (manualMode) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      if (isNaN(lat) || isNaN(lng)) {
        if (onSuccess) onSuccess('Please enter valid coordinates', 'error');
        setLoading(false);
        return;
      }
      sendSOS(lat, lng, address);
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          sendSOS(lat, lng, address);
        },
        (error) => {
          if (onSuccess) onSuccess('Error getting location: ' + error.message, 'error');
          setLoading(false);
        }
      );
    }
  };

  return (
    <>
      <button
        onClick={handleSOS}
        disabled={loading}
        style={{
          padding: '15px 30px',
          fontSize: '16px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
        }}
      >
        {loading ? 'Sending SOS...' : 'SOS'}
      </button>

      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
          }}
          onClick={() => !loading && setShowModal(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '10px',
              maxWidth: '400px',
              width: '90%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0 }}>Send SOS Request</h2>
            {manualMode && (
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Latitude:</label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  style={{ width: '100%', padding: '8px' }}
                  placeholder="e.g., 40.7128"
                />
                <label style={{ display: 'block', marginBottom: '5px', marginTop: '10px' }}>Longitude:</label>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  style={{ width: '100%', padding: '8px' }}
                  placeholder="e.g., -74.0060"
                />
              </div>
            )}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Address (optional):</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ width: '100%', padding: '8px' }}
                placeholder="Enter address if known"
              />
            </div>
            {!manualMode && (
              <button
                onClick={() => setManualMode(true)}
                style={{
                  marginBottom: '15px',
                  padding: '8px 15px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                Enter Coordinates Manually
              </button>
            )}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowModal(false);
                  setManualMode(false);
                }}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmSOS}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Sending...' : 'Send SOS'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SOSButton;

