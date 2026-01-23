import { useState, useEffect, useCallback } from 'react';
import { initDB, addToQueue, getQueue, removeFromQueue, updateQueueItem } from '../utils/db';
import api from '../api/axios';

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

  const processQueue = useCallback(async () => {
    if (!isOnline || isProcessing || queue.length === 0) return;

    setIsProcessing(true);
    setError(null);

    try {
      const pendingItems = queue.filter(item => item.status === 'PENDING');
      for (const item of pendingItems) {
        try {
          const response = await api.post('/sos', {
            latitude: item.latitude,
            longitude: item.longitude,
            message: item.message || 'Emergency SOS request',
            isOffline: false,
          });

          if (response.status === 200 || response.status === 201) {
            await removeFromQueue(item.id);
            setQueue(prev => prev.filter(q => q.id !== item.id));
            console.log('[useOfflineSOS] SOS sent successfully:', item.id);
          }
        } catch (err) {
          const retries = (item.retries || 0) + 1;
          if (retries >= 3) {
            await removeFromQueue(item.id);
            setQueue(prev => prev.filter(q => q.id !== item.id));
            console.error('[useOfflineSOS] Max retries reached, removing:', item.id);
          } else {
            await updateQueueItem(item.id, { retries });
            console.warn('[useOfflineSOS] Retry', retries, 'for item:', item.id);
          }
        }
      }
    } finally {
      setIsProcessing(false);
    }
  }, [queue, isOnline, isProcessing]);

  useEffect(() => {
    if (isOnline && queue.length > 0) {
      processQueue();
    }
  }, [isOnline, queue.length, processQueue]);

  return {
    queue,
    queueSOS,
    processQueue,
    isProcessing,
    error,
    queueLength: queue.length,
  };
};
