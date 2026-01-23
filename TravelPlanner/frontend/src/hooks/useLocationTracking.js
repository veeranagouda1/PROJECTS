import { useState, useEffect, useRef } from 'react';

export const useLocationTracking = (enabled = false, interval = 5000) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const watchIdRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    const updateLocation = (position) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      setAccuracy(position.coords.accuracy);
      setError(null);
    };

    const handleError = (err) => {
      setError(err.message);
      setLocation(null);
    };

    // Use watchPosition for continuous tracking
    watchIdRef.current = navigator.geolocation.watchPosition(
      updateLocation,
      handleError,
      options
    );

    // Also get initial position
    navigator.geolocation.getCurrentPosition(updateLocation, handleError, options);

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [enabled, interval]);

  return { location, error, accuracy };
};

