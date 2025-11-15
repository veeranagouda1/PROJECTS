import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Circle, useMap, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import { useLocationTracking } from '../hooks/useLocationTracking';
import { cacheTile, getCachedTile, getCacheStats } from '../utils/offlineMapCache';
import './GeofenceMap.css';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom TileLayer with offline support
const OfflineTileLayer = ({ url, attribution, ...props }) => {
  const map = useMap();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineMode, setOfflineMode] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!isOnline) {
      setOfflineMode(true);
    }
  }, [isOnline]);

  useEffect(() => {
    if (offlineMode) {
      // Create custom tile layer that uses cache
      const customLayer = L.tileLayer('', {
        ...props,
        getTileUrl: (tilePoint) => {
          const tileUrl = url
            .replace('{s}', 'a')
            .replace('{z}', tilePoint.z)
            .replace('{x}', tilePoint.x)
            .replace('{y}', tilePoint.y);
          
          const cached = getCachedTile(tileUrl);
          if (cached) {
            return URL.createObjectURL(cached);
          }
          return ''; // Return empty if not cached
        },
      });
      
      customLayer.addTo(map);
      
      return () => {
        map.removeLayer(customLayer);
      };
    }
  }, [offlineMode, map, url, props]);

  if (offlineMode) {
    return null; // Custom layer is handled above
  }

  // Online mode - cache tiles as they load
  return (
    <TileLayer
      url={url}
      attribution={attribution}
      eventHandlers={{
        tileload: (e) => {
          // Cache tile when loaded
          fetch(e.tile.src)
            .then(res => res.blob())
            .then(blob => cacheTile(e.tile.src, blob))
            .catch(err => console.error('Failed to cache tile:', err));
        },
      }}
      {...props}
    />
  );
};

// Component to center map on user location
const CenterOnLocation = ({ location, centerOnMe }) => {
  const map = useMap();
  
  useEffect(() => {
    if (centerOnMe && location) {
      map.setView([location.latitude, location.longitude], 15);
    }
  }, [location, centerOnMe, map]);
  
  return null;
};

// Component to show user location marker
const UserLocationMarker = ({ location, accuracy }) => {
  if (!location) return null;
  
  const icon = L.divIcon({
    className: 'user-location-marker',
    html: '<div class="pulse-marker"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
  
  return (
    <>
      <Marker position={[location.latitude, location.longitude]} icon={icon} />
      {accuracy && (
        <Circle
          center={[location.latitude, location.longitude]}
          radius={accuracy}
          pathOptions={{
            color: '#3388ff',
            fillColor: '#3388ff',
            fillOpacity: 0.2,
            weight: 2,
          }}
        />
      )}
    </>
  );
};

const GeofenceMap = () => {
  const [geofences, setGeofences] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [liveIncidents, setLiveIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]);
  const [mapZoom, setMapZoom] = useState(10);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineMode, setOfflineMode] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [centerOnMe, setCenterOnMe] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const { location, error: locationError, accuracy } = useLocationTracking(locationEnabled, 5000);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchLiveIncidents = async () => {
    if (!isOnline) return;
    
    try {
      const response = await api.get('/incident/live');
      setLiveIncidents(response.data || []);
    } catch (error) {
      console.error('Failed to fetch live incidents:', error);
      // Don't show toast for background updates
    }
  };

  useEffect(() => {
    fetchData();
    if (isOnline) {
      fetchLiveIncidents();
    }
  }, []);

  useEffect(() => {
    // Auto-refresh live incidents every 30 seconds when online
    if (!isOnline) return;
    
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchLiveIncidents();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [isOnline]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setOfflineMode(false);
      fetchLiveIncidents();
    };
    const handleOffline = () => {
      setIsOnline(false);
      setOfflineMode(true);
      showToast('Offline Mode: Map loaded from cache', 'info');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchData = async () => {
    try {
      const [geofencesRes, incidentsRes] = await Promise.all([
        api.get('/geofence').catch(() => ({ data: [] })),
        api.get('/incident').catch(() => ({ data: [] })),
      ]);
      setGeofences(geofencesRes.data || []);
      setIncidents(incidentsRes.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      showToast('Failed to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEnableLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', 'error');
      return;
    }
    
    setLocationEnabled(true);
    setCenterOnMe(true);
    showToast('Location tracking enabled', 'success');
  };

  const getSafetyColor = (level) => {
    switch (level) {
      case 'DANGER': return '#ff0000';
      case 'WARNING': return '#ffaa00';
      case 'SAFE': return '#00ff00';
      default: return '#888888';
    }
  };


  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="loading-container">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="geofence-map-page">
      <Navbar />
      <div className="map-container-wrapper">
        <div className="map-legend">
          <h3>Safety Zones</h3>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#ff0000' }}></div>
            <span>Danger Zone</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#ffaa00' }}></div>
            <span>Warning Zone</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#00ff00' }}></div>
            <span>Safe Zone</span>
          </div>
          <div className="legend-item">
            <div className="legend-color heatmap"></div>
            <span>Incident Heatmap</span>
          </div>
        </div>

        {/* Control buttons */}
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}>
          <button
            onClick={handleEnableLocation}
            style={{
              padding: '12px 16px',
              backgroundColor: locationEnabled ? '#28a745' : '#6A5AE0',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              fontSize: '14px',
            }}
            title="Enable location tracking"
          >
            📍 {locationEnabled ? 'Tracking' : 'Center on Me'}
          </button>
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            style={{
              padding: '12px 16px',
              backgroundColor: showHeatmap ? '#ff6600' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              fontSize: '14px',
            }}
            title="Toggle heatmap"
          >
            🔥 {showHeatmap ? 'Hide' : 'Show'} Heatmap
          </button>
        </div>

        {offlineMode && (
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            background: 'rgba(76, 42, 255, 0.9)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            fontSize: '14px',
            fontWeight: '500',
          }}>
            📴 Offline Mode: Map loaded from cache
          </div>
        )}

        {locationError && (
          <div style={{
            position: 'absolute',
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            background: 'rgba(220, 53, 69, 0.9)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            fontSize: '14px',
            fontWeight: '500',
          }}>
            ⚠️ Location Error: {locationError}
          </div>
        )}
        
        <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100vh', width: '100%' }}>
          <OfflineTileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {/* Live Heatmap visualization using circles */}
          {showHeatmap && liveIncidents.map((incident, idx) => {
            const severity = incident.severity || 'MEDIUM';
            const intensity = severity === 'CRITICAL' ? 1.0 : 
                            severity === 'HIGH' ? 0.7 : 
                            severity === 'MEDIUM' ? 0.5 : 0.3;
            const radius = intensity * 1000; // meters
            const color = intensity > 0.8 ? '#ff0000' : intensity > 0.5 ? '#ff6600' : '#ffaa00';
            
            return (
              <Circle
                key={`heat-${incident.id || idx}`}
                center={[incident.lat, incident.lng]}
                radius={radius}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.15,
                  weight: 1,
                }}
              />
            );
          })}

          {/* User Location Marker */}
          <UserLocationMarker location={location} accuracy={accuracy} />
          
          {/* Center on location component */}
          <CenterOnLocation location={location} centerOnMe={centerOnMe} />

          {/* Geofences */}
          {geofences.map(geofence => (
            <CircleMarker
              key={geofence.id}
              center={[geofence.centerLatitude, geofence.centerLongitude]}
              radius={geofence.radius / 50}
              pathOptions={{
                color: getSafetyColor(geofence.safetyLevel),
                fillColor: getSafetyColor(geofence.safetyLevel),
                fillOpacity: 0.3,
                weight: 2,
              }}
            >
              <Popup>
                <div>
                  <h3>{geofence.name}</h3>
                  <p><strong>Safety Level:</strong> {geofence.safetyLevel}</p>
                  <p><strong>Radius:</strong> {geofence.radius}m</p>
                  <p><strong>Incidents:</strong> {geofence.incidentCount}</p>
                  <p>{geofence.description}</p>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* Incidents */}
          {incidents.map(incident => (
            <CircleMarker
              key={incident.id}
              center={[incident.latitude, incident.longitude]}
              radius={8}
              pathOptions={{
                color: incident.severity === 'CRITICAL' ? '#ff0000' : 
                       incident.severity === 'HIGH' ? '#ff6600' : '#ffaa00',
                fillColor: incident.severity === 'CRITICAL' ? '#ff0000' : 
                          incident.severity === 'HIGH' ? '#ff6600' : '#ffaa00',
                fillOpacity: 0.6,
                weight: 2,
              }}
            >
              <Popup>
                <div>
                  <h3>{incident.title}</h3>
                  <p><strong>Type:</strong> {incident.type}</p>
                  <p><strong>Severity:</strong> {incident.severity}</p>
                  <p>{incident.description}</p>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default GeofenceMap;

