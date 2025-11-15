import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import './GeofenceMap.css';

const GeofenceMap = () => {
  const [geofences, setGeofences] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]);
  const [mapZoom, setMapZoom] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [geofencesRes, incidentsRes] = await Promise.all([
        api.get('/geofence'),
        api.get('/incident'),
      ]);
      setGeofences(geofencesRes.data);
      setIncidents(incidentsRes.data);
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

        <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100vh', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {/* Heatmap visualization using circles */}
          {incidents.map(incident => {
            const intensity = incident.severity === 'CRITICAL' ? 1.0 : 
                            incident.severity === 'HIGH' ? 0.7 : 0.4;
            const radius = intensity * 500;
            const color = intensity > 0.8 ? '#ff0000' : intensity > 0.5 ? '#ffaa00' : '#ffff00';
            
            return (
              <Circle
                key={`heat-${incident.id}`}
                center={[incident.latitude, incident.longitude]}
                radius={radius}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.2,
                  weight: 1,
                }}
              />
            );
          })}

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

