import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import './OfflineAlert.css';

export const OfflineAlert = ({ queueLength = 0 }) => {
  const { isOnline, lastOfflineTime } = useOnlineStatus();

  if (isOnline && queueLength === 0) {
    return null;
  }

  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString();
  };

  return (
    <div className={`offline-alert ${isOnline ? 'online' : 'offline'}`}>
      <div className="offline-alert-content">
        <div className="offline-alert-icon">
          {isOnline ? '✓' : '⚠️'}
        </div>
        <div className="offline-alert-text">
          {!isOnline ? (
            <div>
              <strong>📡 No Connection</strong>
              <p>You're offline. Emergency SOS has been queued and will be sent when you're back online.</p>
              {queueLength > 0 && (
                <p className="queue-status">{queueLength} SOS event(s) pending</p>
              )}
            </div>
          ) : (
            <div>
              <strong>✅ Connection Restored</strong>
              {queueLength > 0 && (
                <p>Sending {queueLength} queued SOS event(s)...</p>
              )}
              {lastOfflineTime && (
                <p className="offline-time">
                  You were offline at {formatTime(lastOfflineTime)}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfflineAlert;
