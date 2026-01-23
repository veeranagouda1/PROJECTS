import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const Planner = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [toast, setToast] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [pois, setPois] = useState([]);
  const [formData, setFormData] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    notes: '',
    budget: '',
  });

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    if (selectedTrip) {
      fetchPOIs(selectedTrip.id);
    }
  }, [selectedTrip]);

  const fetchTrips = async () => {
    try {
      const response = await api.get('/trips/user');
      setTrips(response.data);
    } catch (error) {
      showToast('Failed to fetch trips', 'error');
    }
  };

  const fetchPOIs = async (tripId) => {
    try {
      const response = await api.get(`/poi/trip/${tripId}`);
      setPois(response.data);
    } catch (error) {
      console.error('Failed to fetch POIs:', error);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        destination: formData.destination,
        startDate: formData.startDate,
        endDate: formData.endDate,
        notes: formData.notes || null,
        budget: formData.budget ? parseFloat(formData.budget) : null,
      };

      if (editingTrip) {
        await api.put(`/trips/${editingTrip.id}`, payload);
        showToast('Trip updated successfully');
      } else {
        await api.post('/trips', payload);
        showToast('Trip created successfully');
      }

      setShowForm(false);
      setEditingTrip(null);
      resetForm();
      fetchTrips();
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to save trip', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (trip) => {
    setEditingTrip(trip);
    setFormData({
      destination: trip.destination,
      startDate: trip.startDate,
      endDate: trip.endDate,
      notes: trip.notes || '',
      budget: trip.budget || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this trip?')) return;

    try {
      await api.delete(`/trips/${id}`);
      showToast('Trip deleted successfully');
      fetchTrips();
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to delete trip', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      destination: '',
      startDate: '',
      endDate: '',
      notes: '',
      budget: '',
    });
  };

  return (
    <div>
      <Navbar />
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>Travel Planner</h1>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingTrip(null);
              resetForm();
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Add Trip
          </button>
        </div>

        {showForm && (
          <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
            <h2>{editingTrip ? 'Edit Trip' : 'Add New Trip'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Destination:</label>
                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Start Date:</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                    style={{ width: '100%', padding: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px' }}>End Date:</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                    style={{ width: '100%', padding: '8px' }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Budget:</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Notes:</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  style={{ width: '100%', padding: '8px', minHeight: '100px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? 'Saving...' : editingTrip ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingTrip(null);
                    resetForm();
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <h2>Your Trips</h2>
            {trips.length === 0 ? (
              <p>No trips yet. Create your first trip!</p>
            ) : (
              <div>
                {trips.map((trip) => (
                  <div
                    key={trip.id}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      padding: '15px',
                      marginBottom: '15px',
                      cursor: 'pointer',
                      backgroundColor: selectedTrip?.id === trip.id ? '#f0f8ff' : 'white',
                    }}
                    onClick={() => setSelectedTrip(trip)}
                  >
                    <h3>{trip.destination}</h3>
                    <p>
                      {new Date(trip.startDate).toLocaleDateString()} -{' '}
                      {new Date(trip.endDate).toLocaleDateString()}
                    </p>
                    {trip.budget && <p>Budget: ${trip.budget}</p>}
                    {trip.notes && <p>{trip.notes}</p>}
                    <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(trip);
                        }}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(trip.id);
                        }}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedTrip && (
            <div key={`trip-${selectedTrip.id}`}>
              <h2>Map & Points of Interest</h2>
              <div key={`map-container-${selectedTrip.id}`} style={{ height: '400px', marginBottom: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
                <MapContainer
                  key={`map-${selectedTrip.id}`}
                  center={pois.length > 0 ? [pois[0].latitude, pois[0].longitude] : [40.7128, -74.0060]}
                  zoom={pois.length > 0 ? 12 : 10}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {pois.map((poi) => (
                    <Marker key={poi.id} position={[poi.latitude, poi.longitude]}>
                      <Popup>{poi.name}</Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
              <POIForm tripId={selectedTrip.id} onSuccess={() => fetchPOIs(selectedTrip.id)} />
              <div style={{ marginTop: '20px' }}>
                <h3>Points of Interest</h3>
                {pois.map((poi) => (
                  <div
                    key={poi.id}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      padding: '10px',
                      marginBottom: '10px',
                    }}
                  >
                    <strong>{poi.name}</strong>
                    {poi.notes && <p>{poi.notes}</p>}
                    <button
                      onClick={async () => {
                        try {
                          await api.delete(`/poi/${poi.id}`);
                          fetchPOIs(selectedTrip.id);
                        } catch (error) {
                          showToast('Failed to delete POI', 'error');
                        }
                      }}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

const POIForm = ({ tripId, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/poi', {
        tripId,
        name: formData.name,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        notes: formData.notes || null,
      });
      setFormData({ name: '', latitude: '', longitude: '', notes: '' });
      onSuccess();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add POI');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
      <h3>Add Point of Interest</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          style={{ padding: '8px' }}
        />
        <input
          type="number"
          step="any"
          placeholder="Latitude"
          value={formData.latitude}
          onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
          required
          style={{ padding: '8px' }}
        />
        <input
          type="number"
          step="any"
          placeholder="Longitude"
          value={formData.longitude}
          onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
          required
          style={{ padding: '8px' }}
        />
        <input
          type="text"
          placeholder="Notes (optional)"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          style={{ padding: '8px' }}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        style={{
          padding: '8px 15px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        Add POI
      </button>
    </form>
  );
};

export default Planner;
