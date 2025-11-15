import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import './PoliceDashboard.css';

const PoliceDashboard = () => {
  const [incidents, setIncidents] = useState([]);
  const [geofences, setGeofences] = useState([]);
  const [sosEvents, setSosEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [selectedView, setSelectedView] = useState('incidents');
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]);
  const [mapZoom, setMapZoom] = useState(10);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [incidentsRes, geofencesRes, sosRes] = await Promise.all([
        api.get('/incident'),
        api.get('/geofence'),
        api.get('/sos/pending'),
      ]);
      setIncidents(incidentsRes.data);
      setGeofences(geofencesRes.data);
      setSosEvents(sosRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      showToast('Failed to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const updateIncidentStatus = async (id, status) => {
    try {
      await api.put(`/incident/${id}`, { status });
      showToast('Incident status updated');
      fetchData();
    } catch (error) {
      showToast('Failed to update incident', 'error');
    }
  };

  const getSafetyColor = (level) => {
    switch (level) {
      case 'DANGER': return '#ff0000';
      case 'WARNING': return '#ffaa00';
      case 'SAFE': return '#00ff00';
      default: return '#888888';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL': return '#ff0000';
      case 'HIGH': return '#ff6600';
      case 'MEDIUM': return '#ffaa00';
      case 'LOW': return '#00aa00';
      default: return '#888888';
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="police-dashboard">
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>🚔 Police Dashboard</h1>
          <div className="view-tabs">
            <button
              className={selectedView === 'incidents' ? 'active' : ''}
              onClick={() => setSelectedView('incidents')}
            >
              Incidents
            </button>
            <button
              className={selectedView === 'sos' ? 'active' : ''}
              onClick={() => setSelectedView('sos')}
            >
              SOS Events
            </button>
            <button
              className={selectedView === 'geofences' ? 'active' : ''}
              onClick={() => setSelectedView('geofences')}
            >
              Geofences
            </button>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card critical">
            <div className="stat-icon">🚨</div>
            <div className="stat-info">
              <h3>Critical Incidents</h3>
              <p className="stat-value">
                {incidents.filter(i => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length}
              </p>
            </div>
          </div>
          <div className="stat-card warning">
            <div className="stat-icon">⚠️</div>
            <div className="stat-info">
              <h3>Pending SOS</h3>
              <p className="stat-value">{sosEvents.length}</p>
            </div>
          </div>
          <div className="stat-card info">
            <div className="stat-icon">📍</div>
            <div className="stat-info">
              <h3>Active Zones</h3>
              <p className="stat-value">{geofences.length}</p>
            </div>
          </div>
          <div className="stat-card success">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>Resolved Today</h3>
              <p className="stat-value">
                {incidents.filter(i => i.status === 'RESOLVED' && 
                  new Date(i.resolvedAt).toDateString() === new Date().toDateString()).length}
              </p>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="map-section">
            <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '600px', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              
              {selectedView === 'geofences' && geofences.map(geofence => (
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
                      <p><strong>Level:</strong> {geofence.safetyLevel}</p>
                      <p><strong>Incidents:</strong> {geofence.incidentCount}</p>
                      <p>{geofence.description}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}

              {selectedView === 'incidents' && incidents.map(incident => (
                <CircleMarker
                  key={incident.id}
                  center={[incident.latitude, incident.longitude]}
                  radius={10}
                  pathOptions={{
                    color: getSeverityColor(incident.severity),
                    fillColor: getSeverityColor(incident.severity),
                    fillOpacity: 0.6,
                    weight: 3,
                  }}
                >
                  <Popup>
                    <div>
                      <h3>{incident.title}</h3>
                      <p><strong>Type:</strong> {incident.type}</p>
                      <p><strong>Severity:</strong> {incident.severity}</p>
                      <p><strong>Status:</strong> {incident.status}</p>
                      <p>{incident.description}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}

              {selectedView === 'sos' && sosEvents.map(sos => (
                <CircleMarker
                  key={sos.id}
                  center={[sos.latitude, sos.longitude]}
                  radius={15}
                  pathOptions={{
                    color: '#ff0000',
                    fillColor: '#ff0000',
                    fillOpacity: 0.7,
                    weight: 4,
                  }}
                >
                  <Popup>
                    <div>
                      <h3>🚨 SOS Alert</h3>
                      <p><strong>Time:</strong> {new Date(sos.timestamp).toLocaleString()}</p>
                      {sos.message && <p><strong>Message:</strong> {sos.message}</p>}
                      <p><strong>Status:</strong> {sos.status}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>

          <div className="list-section">
            {selectedView === 'incidents' && (
              <div className="incidents-list">
                <h2>Recent Incidents</h2>
                {incidents.slice(0, 10).map(incident => (
                  <div key={incident.id} className="incident-card">
                    <div className="incident-header">
                      <h3>{incident.title}</h3>
                      <span className={`severity-badge ${incident.severity.toLowerCase()}`}>
                        {incident.severity}
                      </span>
                    </div>
                    <p className="incident-type">{incident.type}</p>
                    <p className="incident-description">{incident.description}</p>
                    <div className="incident-footer">
                      <span>{new Date(incident.reportedAt).toLocaleString()}</span>
                      <select
                        value={incident.status}
                        onChange={(e) => updateIncidentStatus(incident.id, e.target.value)}
                        className="status-select"
                      >
                        <option value="OPEN">Open</option>
                        <option value="INVESTIGATING">Investigating</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedView === 'sos' && (
              <div className="sos-list">
                <h2>Pending SOS Events</h2>
                {sosEvents.map(sos => (
                  <div key={sos.id} className="sos-card">
                    <div className="sos-header">
                      <h3>🚨 Emergency SOS</h3>
                      <span className="sos-status">{sos.status}</span>
                    </div>
                    <p><strong>Time:</strong> {new Date(sos.timestamp).toLocaleString()}</p>
                    <p><strong>Location:</strong> {sos.latitude.toFixed(4)}, {sos.longitude.toFixed(4)}</p>
                    {sos.message && <p><strong>Message:</strong> {sos.message}</p>}
                    {sos.isOffline && <p className="offline-badge">📡 Offline Alert</p>}
                    <div className="sos-actions">
                      <button
                        onClick={() => {
                          api.put(`/sos/${sos.id}/status`, { status: 'RESOLVED' })
                            .then(() => {
                              showToast('SOS event resolved');
                              fetchData();
                            })
                            .catch(() => showToast('Failed to update SOS status', 'error'));
                        }}
                        className="btn-resolve"
                      >
                        Mark Resolved
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedView === 'geofences' && (
              <div className="geofences-list">
                <h2>Safety Zones</h2>
                {geofences.map(geofence => (
                  <div key={geofence.id} className="geofence-card">
                    <div className="geofence-header">
                      <h3>{geofence.name}</h3>
                      <span
                        className="safety-badge"
                        style={{ backgroundColor: getSafetyColor(geofence.safetyLevel) }}
                      >
                        {geofence.safetyLevel}
                      </span>
                    </div>
                    <p><strong>Radius:</strong> {geofence.radius}m</p>
                    <p><strong>Incidents:</strong> {geofence.incidentCount}</p>
                    <p>{geofence.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default PoliceDashboard;

