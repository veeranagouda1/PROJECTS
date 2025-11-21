import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Circle, useMap, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import { useLocationTracking } from '../hooks/useLocationTracking';
import './SafetyMap.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

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

const CenterOnLocation = ({ location, centerOnMe }) => {
  const map = useMap();
  
  useEffect(() => {
    if (centerOnMe && location) {
      map.setView([location.latitude, location.longitude], 14);
    }
  }, [location, centerOnMe, map]);
  
  return null;
};

const SafetyMap = () => {
  const [safetyReport, setSafetyReport] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]);
  const [mapZoom, setMapZoom] = useState(12);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showIncidentPanel, setShowIncidentPanel] = useState(false);
  const [hoveredIncident, setHoveredIncident] = useState(null);
  const [hoverTooltipPos, setHoverTooltipPos] = useState(null);
  const [radius, setRadius] = useState(5000);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState('map');
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const { location, error: locationError, accuracy } = useLocationTracking(locationEnabled, 10000);
  const mapRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchSafetyReport = async (lat, lon) => {
    try {
      setLoading(true);
      const response = await api.get('/incident/safety-report', {
        params: {
          latitude: lat,
          longitude: lon,
          radius: radius
        }
      });
      setSafetyReport(response.data);
      setIncidents(response.data.incidents || []);
      setArticles(response.data.articles || []);
      showToast('Safety report updated', 'success');
    } catch (error) {
      console.error('Failed to fetch safety report:', error);
      showToast('Failed to fetch safety report', 'error');
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
    showToast('📍 Location tracking enabled', 'success');
  };

  const handleDisableLocation = () => {
    setLocationEnabled(false);
    setSafetyReport(null);
    setIncidents([]);
    showToast('📍 Location tracking disabled', 'info');
  };

  useEffect(() => {
    if (location && locationEnabled) {
      setMapCenter([location.latitude, location.longitude]);
      fetchSafetyReport(location.latitude, location.longitude);
    }
  }, [location, radius]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (location && locationEnabled && autoRefresh && document.visibilityState === 'visible') {
        fetchSafetyReport(location.latitude, location.longitude);
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [location, locationEnabled, autoRefresh, radius]);

  const getSafetyColor = (level) => {
    switch (level) {
      case 'CRITICAL': return '#ff0000';
      case 'DANGER': return '#ff6600';
      case 'WARNING': return '#ffaa00';
      case 'SAFE': return '#00dd00';
      default: return '#888888';
    }
  };

  const getSafetyIcon = (level) => {
    switch (level) {
      case 'CRITICAL': return '🚨';
      case 'DANGER': return '⚠️';
      case 'WARNING': return '⚡';
      case 'SAFE': return '✅';
      default: return '❓';
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    if (severityFilter === 'ALL') return true;
    return incident.severity === severityFilter;
  });

  const handleIncidentClick = (incident) => {
    setSelectedIncident(incident);
    setShowIncidentPanel(true);
  };

  return (
    <div className="safety-map-page">
      <Navbar />
      
      <div className="safety-map-container">
        {/* Map View */}
        {activeTab === 'map' && (
          <div className="map-wrapper">
            <MapContainer 
              ref={mapRef}
              center={mapCenter} 
              zoom={mapZoom} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />

              {/* Incident Heatmap Circles */}
              {filteredIncidents.map((incident, idx) => {
                const circleRadius = incident.severity === 'CRITICAL' ? 800 : 
                              incident.severity === 'HIGH' ? 600 : 
                              incident.severity === 'MEDIUM' ? 400 : 200;
                const color = incident.severity === 'CRITICAL' ? '#ff0000' :
                             incident.severity === 'HIGH' ? '#ff6600' :
                             incident.severity === 'MEDIUM' ? '#ffaa00' : '#ffdd00';
                
                return (
                  <Circle
                    key={`incident-${incident.id || idx}`}
                    center={[incident.latitude, incident.longitude]}
                    radius={circleRadius}
                    pathOptions={{
                      color: color,
                      fillColor: color,
                      fillOpacity: hoveredIncident?.id === incident.id ? 0.5 : 0.25,
                      weight: hoveredIncident?.id === incident.id ? 3 : 2,
                    }}
                    eventHandlers={{
                      mouseover: (e) => {
                        setHoveredIncident(incident);
                        e.target.bringToFront();
                      },
                      mouseout: () => {
                        setHoveredIncident(null);
                      }
                    }}
                  >
                    <Popup>
                      <div className="incident-popup">
                        <h4>{incident.title}</h4>
                        <p><strong>Type:</strong> {incident.type}</p>
                        <p><strong>Severity:</strong> {incident.severity}</p>
                        <p><strong>Distance:</strong> {(incident.distance / 1000).toFixed(2)} km</p>
                        <p><strong>Status:</strong> {incident.status}</p>
                        <button 
                          onClick={() => handleIncidentClick(incident)}
                          className="view-details-btn"
                        >
                          View Details →
                        </button>
                      </div>
                    </Popup>
                  </Circle>
                );
              })}

              {/* User Location Marker */}
              <UserLocationMarker location={location} accuracy={accuracy} />
              <CenterOnLocation location={location} centerOnMe={true} />
            </MapContainer>

            {/* Map Controls */}
            <div className="map-controls">
              <div className="control-group">
                {!locationEnabled ? (
                  <button className="btn-primary" onClick={handleEnableLocation}>
                    📍 Enable Location Tracking
                  </button>
                ) : (
                  <button className="btn-success" onClick={handleDisableLocation}>
                    ✓ Tracking Active
                  </button>
                )}
              </div>

              <div className="control-group">
                <label>Search Radius (m):</label>
                <select 
                  value={radius} 
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="select-control"
                >
                  <option value={1000}>1 km</option>
                  <option value={2500}>2.5 km</option>
                  <option value={5000}>5 km</option>
                  <option value={10000}>10 km</option>
                  <option value={25000}>25 km</option>
                </select>
              </div>

              <div className="control-group">
                <label>Filter by Severity:</label>
                <select 
                  value={severityFilter} 
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="select-control"
                >
                  <option value="ALL">All Incidents</option>
                  <option value="CRITICAL">🚨 Critical</option>
                  <option value="HIGH">⚠️ High</option>
                  <option value="MEDIUM">⚡ Medium</option>
                  <option value="LOW">✓ Low</option>
                </select>
              </div>

              <div className="control-group">
                <label>
                  <input 
                    type="checkbox" 
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                  />
                  Auto Refresh (30s)
                </label>
              </div>
            </div>

            {/* Safety Report Card */}
            {safetyReport && (
              <div className="safety-report-card">
                <div className="report-header" style={{ borderLeft: `4px solid ${getSafetyColor(safetyReport.safetyLevel)}` }}>
                  <span className="safety-icon">{getSafetyIcon(safetyReport.safetyLevel)}</span>
                  <div>
                    <h3>Safety Status: {safetyReport.safetyLevel}</h3>
                    <p>{safetyReport.totalIncidents} incidents within {(radius / 1000).toFixed(1)} km</p>
                  </div>
                </div>
                <div className="report-stats">
                  <div className="stat" style={{ borderColor: '#ff0000' }}>
                    <div className="stat-value">{safetyReport.criticalCount}</div>
                    <div className="stat-label">Critical</div>
                  </div>
                  <div className="stat" style={{ borderColor: '#ff6600' }}>
                    <div className="stat-value">{safetyReport.highCount}</div>
                    <div className="stat-label">High</div>
                  </div>
                  <div className="stat" style={{ borderColor: '#ffaa00' }}>
                    <div className="stat-value">{safetyReport.mediumCount}</div>
                    <div className="stat-label">Medium</div>
                  </div>
                  <div className="stat" style={{ borderColor: '#ffdd00' }}>
                    <div className="stat-value">{safetyReport.lowCount}</div>
                    <div className="stat-label">Low</div>
                  </div>
                </div>
              </div>
            )}

            {/* Hover Tooltip */}
            {hoveredIncident && (
              <div className="hover-tooltip">
                <div className="tooltip-content" style={{ borderLeft: `4px solid ${getSafetyColor(hoveredIncident.severity)}` }}>
                  <h4>{hoveredIncident.title}</h4>
                  <p><strong>Type:</strong> {hoveredIncident.type}</p>
                  <p><strong>Severity:</strong> <span className={`severity-badge ${hoveredIncident.severity.toLowerCase()}`}>{hoveredIncident.severity}</span></p>
                  <p><strong>Distance:</strong> {(hoveredIncident.distance / 1000).toFixed(2)} km</p>
                  <p><strong>Status:</strong> {hoveredIncident.status}</p>
                  <button 
                    onClick={() => handleIncidentClick(hoveredIncident)}
                    className="view-details-btn"
                  >
                    View Full Details →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Incidents & Articles Panel */}
        <div className={`side-panel ${activeTab === 'incidents' ? 'active' : ''}`}>
          <div className="panel-tabs">
            <button 
              className={`tab-btn ${activeTab === 'map' ? 'active' : ''}`}
              onClick={() => setActiveTab('map')}
            >
              🗺️ Map
            </button>
            <button 
              className={`tab-btn ${activeTab === 'incidents' ? 'active' : ''}`}
              onClick={() => setActiveTab('incidents')}
            >
              ⚠️ Incidents ({filteredIncidents.length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'articles' ? 'active' : ''}`}
              onClick={() => setActiveTab('articles')}
            >
              📰 News
            </button>
          </div>

          {/* Incidents List */}
          {activeTab === 'incidents' && (
            <div className="panel-content">
              <h2>Nearby Incidents</h2>
              {filteredIncidents.length === 0 ? (
                <div className="empty-state">
                  <p>✅ No incidents in this area</p>
                </div>
              ) : (
                <div className="incidents-list">
                  {filteredIncidents.map((incident, idx) => (
                    <div 
                      key={`${incident.id}-${idx}`}
                      className="incident-item"
                      onClick={() => handleIncidentClick(incident)}
                    >
                      <div className="incident-header">
                        <span className={`severity-badge ${incident.severity.toLowerCase()}`}>
                          {incident.severity}
                        </span>
                        <span className="incident-type">{incident.type}</span>
                      </div>
                      <h4>{incident.title}</h4>
                      <p className="incident-description">{incident.description}</p>
                      <div className="incident-meta">
                        <span>📍 {(incident.distance / 1000).toFixed(2)} km away</span>
                        <span>🕐 {new Date(incident.reportedAt).toLocaleDateString()}</span>
                      </div>
                      <span className="status-badge">{incident.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Articles Tab */}
          {activeTab === 'articles' && (
            <div className="panel-content">
              <h2>Safety News & Tips</h2>
              {articles.length === 0 ? (
                <div className="empty-state">
                  <p>No articles available</p>
                </div>
              ) : (
                <div className="articles-list">
                  {articles.map((article, idx) => (
                    <div key={`${article.id}-${idx}`} className="article-item">
                      <span className="article-category">{article.category}</span>
                      <h4>{article.title}</h4>
                      <p>{article.summary}</p>
                      <div className="article-meta">
                        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Incident Detail Modal */}
      {showIncidentPanel && selectedIncident && (
        <div className="incident-modal" onClick={() => setShowIncidentPanel(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowIncidentPanel(false)}>✕</button>
            <div className="modal-header" style={{ borderLeft: `4px solid ${getSafetyColor(selectedIncident.severity)}` }}>
              <h2>{selectedIncident.title}</h2>
              <span className={`severity-badge ${selectedIncident.severity.toLowerCase()}`}>
                {selectedIncident.severity}
              </span>
            </div>
            <div className="modal-body">
              <div className="detail-item">
                <label>Type:</label>
                <p>{selectedIncident.type}</p>
              </div>
              <div className="detail-item">
                <label>Description:</label>
                <p>{selectedIncident.description}</p>
              </div>
              <div className="detail-item">
                <label>Status:</label>
                <p>{selectedIncident.status}</p>
              </div>
              <div className="detail-item">
                <label>Reported At:</label>
                <p>{new Date(selectedIncident.reportedAt).toLocaleString()}</p>
              </div>
              <div className="detail-item">
                <label>Distance:</label>
                <p>{(selectedIncident.distance / 1000).toFixed(2)} km</p>
              </div>
              <div className="detail-item">
                <label>Coordinates:</label>
                <p>{selectedIncident.latitude.toFixed(4)}, {selectedIncident.longitude.toFixed(4)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {locationError && (
        <div className="location-error">
          ⚠️ Location Error: {locationError}
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Updating safety data...</p>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default SafetyMap;
