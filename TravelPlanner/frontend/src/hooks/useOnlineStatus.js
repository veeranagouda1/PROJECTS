import { useState, useEffect } from 'react';

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  const [lastOfflineTime, setLastOfflineTime] = useState(null);

  useEffect(() => {
    const handleOnline = () => {
      console.log('[useOnlineStatus] Device came online');
      setIsOnline(true);
    };

    const handleOffline = () => {
      console.log('[useOnlineStatus] Device went offline');
      setIsOnline(false);
      setLastOfflineTime(new Date());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const pingInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/ping', { method: 'GET' });
        if (response.ok && !isOnline) {
          setIsOnline(true);
        }
      } catch (error) {
        if (isOnline) {
          setIsOnline(false);
          setLastOfflineTime(new Date());
        }
      }
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(pingInterval);
    };
  }, [isOnline]);

  return isOnline; // Return boolean directly for simpler usage
};
