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
    isPrimary: false,
  });

  // Fetch Contacts on Load
  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/emergency');
      setContacts(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  // Handle form input
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Add or Update Contact
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (editingId) {
        await api.put(`/emergency/${editingId}`, formData);
        setSuccess('Contact updated successfully');
      } else {
        await api.post('/emergency', formData);
        setSuccess('Contact added successfully');
      }

      fetchContacts();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save contact');
    }
  };

  // Edit Contact
  const handleEdit = (contact) => {
    setFormData(contact);
    setEditingId(contact.id);
    setShowForm(true);
  };

  // Delete Contact
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;

    try {
      await api.delete(`/emergency/${id}`);
      setSuccess('Contact deleted successfully');
      fetchContacts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete contact');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      relationship: '',
      isPrimary: false,
    });
    setEditingId(null);
    setShowForm(false);
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
              <h3>{editingId ? 'Edit Contact' : 'Add New Contact'}</h3>
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
                  placeholder="+1 555-123-4567"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email (optional)</label>
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
                  placeholder="Family / Friend / Doctor"
                />
              </div>

              <div className="form-group">
                <label className="checkbox">
                  <input
                    type="checkbox"
                    name="isPrimary"
                    checked={formData.isPrimary}
                    onChange={handleInputChange}
                  />
                  Set as Primary Contact
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  {editingId ? 'Update Contact' : 'Add Contact'}
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
          <p>No emergency contacts added yet.</p>
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
                {contact.isPrimary && (
                  <span className="primary-badge">⭐ Primary</span>
                )}
              </div>

              <div className="contact-actions">
                <button className="btn-action btn-edit" onClick={() => handleEdit(contact)}>✏️</button>
                <button className="btn-action btn-delete" onClick={() => handleDelete(contact.id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmergencyContactManager;
