import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useOfflineSOS } from '../hooks/useOfflineSOS';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

const SOSButtonEnhanced = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const isOnline = useOnlineStatus();
  const { queueSOS, queueLength, processQueue } = useOfflineSOS(isOnline);

  useEffect(() => {
    if (isOnline && queueLength > 0) {
      processQueue(api);
    }
  }, [isOnline, queueLength, processQueue]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setLocationError(null);
        setLoading(false);
      },
      (error) => {
        setLocationError(`Location error: ${error.message}`);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSOS = () => {
    getCurrentLocation();
    setShowModal(true);
  };

  const [manualLocation, setManualLocation] = useState({ lat: '', lng: '' });
  const [useManualLocation, setUseManualLocation] = useState(false);

  const confirmSOS = async () => {
    let finalLat, finalLng;
    
    if (useManualLocation) {
      finalLat = parseFloat(manualLocation.lat);
      finalLng = parseFloat(manualLocation.lng);
      if (isNaN(finalLat) || isNaN(finalLng)) {
        setLocationError('Please enter valid coordinates');
        return;
      }
    } else if (!location) {
      setLocationError('Please wait for location or enter coordinates manually');
      return;
    } else {
      finalLat = location.latitude;
      finalLng = location.longitude;
    }

    setLoading(true);
    const sosData = {
      latitude: finalLat,
      longitude: finalLng,
      message: message || 'Emergency SOS request',
      timestamp: new Date().toISOString(),
      batteryLevel: null, // Battery API not widely supported, removed for compatibility
    };

    try {
      if (isOnline) {
        // Send directly
        await api.post('/sos', sosData);
        onSuccess?.('SOS sent successfully! Emergency contacts have been notified.', 'success');
        setShowModal(false);
        setMessage('');
        setLocation(null);
      } else {
        // Queue for offline
        await queueSOS(sosData);
        onSuccess?.('SOS queued offline. It will be sent automatically when connection is restored.', 'info');
        setShowModal(false);
        setMessage('');
        setLocation(null);
      }
    } catch (error) {
      // If online send fails, queue it
      if (isOnline) {
        try {
          await queueSOS(sosData);
          onSuccess?.('SOS queued. Will retry automatically.', 'info');
        } catch (queueError) {
          onSuccess?.('Failed to send SOS. Please try again.', 'error');
        }
      } else {
        onSuccess?.('Failed to queue SOS. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const getSMSLink = () => {
    if (!location) return null;
    const primaryContact = JSON.parse(localStorage.getItem('primaryContact') || '{}');
    if (!primaryContact.phone) return null;
    
    const smsText = `URGENT SOS: I need help at ${location.latitude},${location.longitude}. ${message || 'Please help!'}`;
    return `sms:${primaryContact.phone}?body=${encodeURIComponent(smsText)}`;
  };

  return (
    <>
      <button
        onClick={handleSOS}
        disabled={loading}
        style={{
          padding: '20px 40px',
          fontSize: '20px',
          fontWeight: 'bold',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 15px rgba(220, 53, 69, 0.4)',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = '0 6px 20px rgba(220, 53, 69, 0.6)';
          }
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 4px 15px rgba(220, 53, 69, 0.4)';
        }}
      >
        {loading ? '🔄 Sending...' : '🆘 SOS'}
        {queueLength > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              backgroundColor: '#ffc107',
              color: '#000',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            {queueLength}
          </span>
        )}
      </button>

      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            backdropFilter: 'blur(5px)',
          }}
          onClick={() => !loading && setShowModal(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '16px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
            className="dark:bg-gray-800 dark:text-white"
          >
            <h2 style={{ marginTop: 0, color: '#dc3545' }}>🚨 Send SOS Alert</h2>
            
            {!isOnline && (
              <div
                style={{
                  padding: '12px',
                  backgroundColor: '#fff3cd',
                  border: '1px solid #ffc107',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  color: '#856404',
                }}
              >
                ⚠️ You are offline. SOS will be queued and sent automatically when connection is restored.
              </div>
            )}

            {location && !useManualLocation ? (
              <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <p><strong>📍 Location:</strong></p>
                <p>Lat: {location.latitude.toFixed(6)}</p>
                <p>Lng: {location.longitude.toFixed(6)}</p>
                {location.accuracy && <p>Accuracy: ±{Math.round(location.accuracy)}m</p>}
                <button
                  onClick={() => setUseManualLocation(true)}
                  style={{
                    marginTop: '10px',
                    padding: '6px 12px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  Enter Coordinates Manually
                </button>
              </div>
            ) : useManualLocation ? (
              <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <p><strong>📍 Enter Coordinates:</strong></p>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Latitude:</label>
                  <input
                    type="number"
                    step="any"
                    value={manualLocation.lat}
                    onChange={(e) => setManualLocation({ ...manualLocation, lat: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                    placeholder="e.g., 40.7128"
                  />
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Longitude:</label>
                  <input
                    type="number"
                    step="any"
                    value={manualLocation.lng}
                    onChange={(e) => setManualLocation({ ...manualLocation, lng: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                    placeholder="e.g., -74.0060"
                  />
                </div>
                <button
                  onClick={() => {
                    setUseManualLocation(false);
                    getCurrentLocation();
                  }}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  Use GPS Location Instead
                </button>
              </div>
            ) : (
              <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                <p>📍 Getting your location...</p>
                {locationError && (
                  <div>
                    <p style={{ color: '#dc3545', fontSize: '14px', marginBottom: '10px' }}>{locationError}</p>
                    <button
                      onClick={() => setUseManualLocation(true)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#6A5AE0',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                      }}
                    >
                      Enter Coordinates Manually
                    </button>
                  </div>
                )}
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Message (optional):
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid #e0e0e0',
                  minHeight: '100px',
                  fontFamily: 'inherit',
                }}
                placeholder="Describe your emergency situation..."
                disabled={loading}
              />
            </div>

            {!isOnline && getSMSLink() && (
              <div style={{ marginBottom: '20px' }}>
                <a
                  href={getSMSLink()}
                  style={{
                    display: 'block',
                    padding: '12px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontWeight: '500',
                  }}
                >
                  📱 Send SMS to Primary Contact
                </a>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowModal(false);
                  setMessage('');
                  setLocation(null);
                  setLocationError(null);
                  setManualLocation({ lat: '', lng: '' });
                  setUseManualLocation(false);
                }}
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: '500',
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmSOS}
                disabled={loading || (!location && !useManualLocation)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading || (!location && !useManualLocation) ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  opacity: loading || (!location && !useManualLocation) ? 0.6 : 1,
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

export default SOSButtonEnhanced;

