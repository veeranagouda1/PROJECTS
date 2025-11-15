import { useState, useEffect, useCallback } from 'react';
import { initDB, addToQueue, getQueue, clearQueue, removeFromQueue } from '../utils/db';

export const useOfflineSOS = (isOnline) => {
  const [queue, setQueue] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadQueue = async () => {
      try {
        await initDB();
        const items = await getQueue();
        setQueue(items);
      } catch (err) {
        console.error('Error loading offline queue:', err);
        setError(err.message);
      }
    };
    loadQueue();
  }, []);

  const queueSOS = useCallback(async (sosData) => {
    try {
      const entry = {
        ...sosData,
        queuedAt: new Date().toISOString(),
        status: 'PENDING',
        retries: 0,
      };
      
      await addToQueue(entry);
      setQueue([...queue, entry]);
      
      console.log('[useOfflineSOS] SOS queued:', entry);
      return entry;
    } catch (err) {
      console.error('Error queueing SOS:', err);
      setError(err.message);
      throw err;
    }
  }, [queue]);

  const processQueue = useCallback(async (api) => {
    if (!isOnline || isProcessing || queue.length === 0) return;

    setIsProcessing(true);
    setError(null);

    try {
      for (const item of queue) {
        if (item.status === 'PENDING') {
          try {
            const response = await api.post('/sos/offline-alert', {
              lastOfflineLat: item.lastLat,
              lastOfflineLng: item.lastLng,
              offlineStart: item.offlineStart,
              deviceInfo: item.deviceInfo,
              currentLat: item.currentLat,
              currentLng: item.currentLng,
            });

            if (response.status === 200) {
              await removeFromQueue(item.id);
              setQueue(queue.filter(q => q.id !== item.id));
              console.log('[useOfflineSOS] SOS sent successfully:', item.id);
            }
          } catch (err) {
            item.retries = (item.retries || 0) + 1;
            if (item.retries >= 3) {
              await removeFromQueue(item.id);
              setQueue(queue.filter(q => q.id !== item.id));
            }
            console.error('Error sending SOS:', err);
          }
        }
      }
    } finally {
      setIsProcessing(false);
    }
  }, [queue, isOnline, isProcessing]);

  useEffect(() => {
    if (isOnline && queue.length > 0) {
      processQueue(window.__api);
    }
  }, [isOnline, queue, processQueue]);

  return {
    queue,
    queueSOS,
    processQueue,
    isProcessing,
    error,
    queueLength: queue.length,
  };
};
