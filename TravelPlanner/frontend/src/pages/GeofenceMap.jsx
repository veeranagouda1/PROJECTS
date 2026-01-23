import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Circle, useMap, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
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

// Component to fit map bounds to incidents when they change
const FitBoundsOnIncidents = ({ incidents, enabled = true }) => {
  const map = useMap();

  useEffect(() => {
    if (!enabled) return;
    if (!incidents || incidents.length === 0) return;

    try {
      const latLngs = incidents.map(i => [i.lat ?? i.latitude, i.lng ?? i.longitude]);
      const bounds = L.latLngBounds(latLngs.filter(p => p[0] != null && p[1] != null));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    } catch (e) {
      // ignore invalid coords
    }
  }, [incidents, enabled, map]);

  return null;
};

// Heatmap layer using leaflet.heat
const HeatmapLayer = ({ points = [], radius = 25, blur = 15, maxZoom = 17 }) => {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return;

    const heatPoints = points
      .map(p => {
        const lat = p.lat ?? p.latitude;
        const lng = p.lng ?? p.longitude;
        if (lat == null || lng == null) return null;
        const severity = (p.severity || 'MEDIUM').toUpperCase();
        const intensity = severity === 'CRITICAL' ? 1.0 : severity === 'HIGH' ? 0.7 : severity === 'MEDIUM' ? 0.5 : 0.3;
        return [lat, lng, intensity];
      })
      .filter(Boolean);

    const heatLayer = L.heatLayer(heatPoints, { radius, blur, maxZoom }).addTo(map);
    return () => {
      heatLayer.remove();
    };
  }, [points, radius, blur, maxZoom, map]);

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
  const [showDebugMarkers, setShowDebugMarkers] = useState(true);
  const [mapInstance, setMapInstance] = useState(null);
  const [useSmoothHeatmap, setUseSmoothHeatmap] = useState(true);
  const [centerOnMe, setCenterOnMe] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [showArticlesModal, setShowArticlesModal] = useState(false);
  const [articlesNear, setArticlesNear] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
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
          <button
            onClick={() => setShowDebugMarkers(!showDebugMarkers)}
            style={{
              padding: '12px 16px',
              backgroundColor: showDebugMarkers ? '#17a2b8' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              fontSize: '14px',
            }}
            title="Toggle debug markers"
          >
            📍 {showDebugMarkers ? 'Hide' : 'Show'} Markers
          </button>
          <button
            onClick={() => setUseSmoothHeatmap(!useSmoothHeatmap)}
            style={{
              padding: '12px 16px',
              backgroundColor: useSmoothHeatmap ? '#20c997' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              fontSize: '14px',
            }}
            title="Toggle smooth heatmap"
          >
            ♨️ {useSmoothHeatmap ? 'Heatmap' : 'Circles'}
          </button>
          <button
            onClick={async () => {
              if (!navigator.geolocation) {
                showToast('Geolocation not available', 'error');
                return;
              }
              setArticlesLoading(true);
              navigator.geolocation.getCurrentPosition(async (pos) => {
                try {
                  const lat = pos.coords.latitude;
                  const lng = pos.coords.longitude;
                  const res = await api.get(`/articles/near?lat=${lat}&lng=${lng}&radius=5000`);
                  setArticlesNear(res.data || []);
                  setShowArticlesModal(true);
                } catch (err) {
                  console.error('Failed to fetch nearby articles', err);
                  showToast('Failed to fetch nearby articles', 'error');
                } finally {
                  setArticlesLoading(false);
                }
              }, (err) => {
                setArticlesLoading(false);
                showToast('Unable to get location: ' + (err.message || 'error'), 'error');
              });
            }}
            style={{
              padding: '12px 16px',
              backgroundColor: '#2b8cff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              fontSize: '14px',
            }}
            title="Articles near me"
          >
            📰 Articles Near Me
            {articlesLoading && <span style={{ marginLeft: 8 }}>...</span>}
          </button>
          <button
            onClick={() => {
              if (!mapInstance || !liveIncidents || liveIncidents.length === 0) return;
              try {
                const latLngs = liveIncidents.map(i => [i.lat ?? i.latitude, i.lng ?? i.longitude]);
                const bounds = L.latLngBounds(latLngs.filter(p => p[0] != null && p[1] != null));
                if (bounds.isValid()) mapInstance.fitBounds(bounds, { padding: [40, 40] });
              } catch (e) { }
            }}
            style={{
              padding: '12px 16px',
              backgroundColor: '#6A5AE0',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              fontSize: '14px',
            }}
            title="Center map on incidents"
          >
            🎯 Center on Incidents
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

        <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100vh', width: '100%' }} whenCreated={(map) => setMapInstance(map)}>
          <OfflineTileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {/* Auto fit bounds to live incidents */}
          <FitBoundsOnIncidents incidents={liveIncidents} enabled={true} />

          {/* Live Heatmap visualization using circles (or smooth heatmap) */}
          {showHeatmap && useSmoothHeatmap && <HeatmapLayer points={liveIncidents} radius={35} blur={25} />}
          {showHeatmap && !useSmoothHeatmap && liveIncidents.map((incident, idx) => {
            const severity = incident.severity || 'MEDIUM';
            const intensity = severity === 'CRITICAL' ? 1.0 :
              severity === 'HIGH' ? 0.7 :
                severity === 'MEDIUM' ? 0.5 : 0.3;
            // increase radius for clearer visualization during dev
            const radius = intensity * 3000; // meters
            const color = intensity > 0.8 ? '#ff0000' : intensity > 0.5 ? '#ff6600' : '#ffaa00';

            return (
              <Circle
                key={`heat-${incident.id || idx}`}
                center={[incident.lat, incident.lng]}
                radius={radius}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.4,
                  weight: 1,
                }}
              />
            );
          })}

          {/* Debug markers so incidents are obvious even with subtle heatmap */}
          {showDebugMarkers && liveIncidents.map((incident, idx) => (
            <CircleMarker
              key={`dbg-${incident.id || idx}`}
              center={[incident.lat, incident.lng]}
              radius={10}
              pathOptions={{
                color: '#0047ab',
                fillColor: '#0047ab',
                fillOpacity: 0.9,
                weight: 1,
              }}
            >
              <Popup>
                <div style={{ minWidth: '220px' }}>
                  <h3 style={{ margin: '0 0 6px 0' }}>{incident.title || incident.type}</h3>
                  <div style={{ fontSize: '13px', marginBottom: '6px' }}><strong>Severity:</strong> {incident.severity}</div>
                  {incident.description && <div style={{ fontSize: '13px', marginBottom: '8px' }}>{incident.description}</div>}
                  <div style={{ borderTop: '1px solid #eee', paddingTop: '6px' }}>
                    <strong>Related Articles</strong>
                    {incident.articles && incident.articles.length > 0 ? (
                      <ul style={{ paddingLeft: '16px', margin: '6px 0' }}>
                        {incident.articles.map(a => (
                          <li key={a.id} style={{ marginBottom: '6px' }}>
                            <a href={a.url || '#'} target="_blank" rel="noreferrer" style={{ color: '#2a6cff' }}>{a.title || a.source || 'Read more'}</a>
                            {a.summary && <div style={{ fontSize: '12px', color: '#555' }}>{a.summary}</div>}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div style={{ fontSize: '13px', color: '#777', marginTop: '6px' }}>No articles available</div>
                    )}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}

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
                <div style={{ minWidth: '220px' }}>
                  <h3 style={{ margin: '0 0 6px 0' }}>{incident.title}</h3>
                  <p style={{ margin: '0 0 6px 0' }}><strong>Type:</strong> {incident.type} &nbsp; <strong>Severity:</strong> {incident.severity}</p>
                  <div style={{ marginBottom: '8px' }}>{incident.description}</div>

                  {/* If this incident object contains articles (from live endpoint), show them */}
                  {incident.articles && incident.articles.length > 0 && (
                    <div style={{ borderTop: '1px solid #eee', paddingTop: '6px' }}>
                      <strong>Articles</strong>
                      <ul style={{ paddingLeft: '16px', margin: '6px 0' }}>
                        {incident.articles.map(a => (
                          <li key={a.id} style={{ marginBottom: '6px' }}>
                            <a href={a.url || '#'} target="_blank" rel="noreferrer" style={{ color: '#2a6cff' }}>{a.title || a.source || 'Read more'}</a>
                            {a.summary && <div style={{ fontSize: '12px', color: '#555' }}>{a.summary}</div>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Articles Near Me Modal */}
      {showArticlesModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowArticlesModal(false)} />
          <div style={{ background: 'white', borderRadius: 8, width: 'min(920px, 96%)', maxHeight: '80vh', overflowY: 'auto', padding: 20, boxShadow: '0 12px 40px rgba(0,0,0,0.3)', position: 'relative' }}>
            <button onClick={() => setShowArticlesModal(false)} style={{ position: 'absolute', right: 12, top: 12, border: 'none', background: 'transparent', fontSize: 18, cursor: 'pointer' }}>✕</button>
            <h2>Articles Near You</h2>
            {articlesNear.length === 0 ? (
              <div style={{ color: '#666' }}>No articles found near your current location.</div>
            ) : (
              <div>
                {articlesNear.map(a => (
                  <div key={a.id} style={{ padding: '12px 0', borderBottom: '1px solid #eee' }}>
                    <a href={a.url || '#'} target="_blank" rel="noreferrer" style={{ fontSize: 16, color: '#2a6cff', fontWeight: 600 }}>{a.title}</a>
                    {a.source && <div style={{ fontSize: 12, color: '#888' }}>{a.source} • {new Date(a.publishedAt).toLocaleString()}</div>}
                    {a.summary && <div style={{ marginTop: 8 }}>{a.summary}</div>}
                    <div style={{ marginTop: 8 }}><a href={a.url || '#'} target="_blank" rel="noreferrer" style={{ color: '#6A5AE0' }}>Read full article</a></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default GeofenceMap;

