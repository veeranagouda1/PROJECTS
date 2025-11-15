import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import './EmergencyContactManager.css';

export const EmergencyContactManager = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: '',
    priority: 'SECONDARY',
    canReceiveSms: true,
    canReceiveEmail: true,
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/contacts?page=0&size=50');
      setContacts(response.data.content || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (editingId) {
        await api.put(`/contacts/${editingId}`, formData);
        setSuccess('Contact updated successfully');
      } else {
        await api.post('/contacts', formData);
        setSuccess('Contact added successfully');
      }

      await fetchContacts();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save contact');
    }
  };

  const handleEdit = (contact) => {
    setFormData(contact);
    setEditingId(contact.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;

    try {
      await api.delete(`/contacts/${id}`);
      setSuccess('Contact deleted successfully');
      await fetchContacts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete contact');
    }
  };

  const handleTestNotification = async (id, type = 'SMS') => {
    try {
      await api.post(`/contacts/${id}/test-notification?type=${type}`);
      setSuccess(`Test ${type} notification sent`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send test notification');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      relationship: '',
      priority: 'SECONDARY',
      canReceiveSms: true,
      canReceiveEmail: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      PRIMARY: '#667eea',
      SECONDARY: '#00d2fc',
      TERTIARY: '#764ba2',
      POLICE: '#ff6b6b',
      HOSPITAL: '#51cf66',
    };
    return (
      <span
        style={{
          backgroundColor: colors[priority],
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold',
        }}
      >
        {priority}
      </span>
    );
  };

  return (
    <div className="emergency-contact-manager">
      <div className="ecm-header">
        <h2>👥 Emergency Contacts</h2>
        <button className="btn-add-contact" onClick={() => setShowForm(true)}>
          + Add Contact
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <div className="contact-form-modal">
          <div className="contact-form">
            <div className="form-header">
              <h3>{editingId ? 'Edit' : 'Add New'} Emergency Contact</h3>
              <button className="btn-close" onClick={resetForm}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="John Doe"
                />
              </div>

              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                />
              </div>

              <div className="form-group">
                <label>Relationship</label>
                <input
                  type="text"
                  name="relationship"
                  value={formData.relationship}
                  onChange={handleInputChange}
                  placeholder="Family/Friend/Doctor"
                />
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                >
                  <option value="PRIMARY">Primary</option>
                  <option value="SECONDARY">Secondary</option>
                  <option value="TERTIARY">Tertiary</option>
                  <option value="POLICE">Police</option>
                  <option value="HOSPITAL">Hospital</option>
                </select>
              </div>

              <div className="form-checkboxes">
                <label className="checkbox">
                  <input
                    type="checkbox"
                    name="canReceiveSms"
                    checked={formData.canReceiveSms}
                    onChange={handleInputChange}
                  />
                  Can receive SMS
                </label>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    name="canReceiveEmail"
                    checked={formData.canReceiveEmail}
                    onChange={handleInputChange}
                  />
                  Can receive Email
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  {editingId ? 'Update' : 'Add'} Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading contacts...</div>
      ) : contacts.length === 0 ? (
        <div className="empty-state">
          <p>No emergency contacts yet. Add one to get started.</p>
        </div>
      ) : (
        <div className="contacts-list">
          {contacts.map((contact) => (
            <div key={contact.id} className="contact-card">
              <div className="contact-info">
                <h4>{contact.name}</h4>
                <p className="phone">📱 {contact.phone}</p>
                {contact.email && <p className="email">📧 {contact.email}</p>}
                {contact.relationship && (
                  <p className="relationship">👥 {contact.relationship}</p>
                )}
              </div>

              <div className="contact-meta">
                <div className="priority">{getPriorityBadge(contact.priority)}</div>
                {contact.confirmed && (
                  <span className="confirmed" title="Confirmed">✓</span>
                )}
              </div>

              <div className="contact-actions">
                <button
                  className="btn-action btn-test-sms"
                  onClick={() => handleTestNotification(contact.id, 'SMS')}
                  title="Send test SMS"
                >
                  📨
                </button>
                <button
                  className="btn-action btn-test-email"
                  onClick={() => handleTestNotification(contact.id, 'EMAIL')}
                  title="Send test Email"
                >
                  ✉️
                </button>
                <button
                  className="btn-action btn-edit"
                  onClick={() => handleEdit(contact)}
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  className="btn-action btn-delete"
                  onClick={() => handleDelete(contact.id)}
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmergencyContactManager;
