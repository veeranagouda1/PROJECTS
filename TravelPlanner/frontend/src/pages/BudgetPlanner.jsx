import { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const BudgetPlanner = () => {
  const [budgets, setBudgets] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    tripId: '',
    category: '',
    amount: '',
    notes: '',
    date: '',
  });

  useEffect(() => {
    fetchBudgets();
    fetchTrips();
  }, []);

  const fetchBudgets = async () => {
    try {
      const response = await api.get('/budget/user');
      setBudgets(response.data);
    } catch (error) {
      showToast('Failed to fetch budgets', 'error');
    }
  };

  const fetchTrips = async () => {
    try {
      const response = await api.get('/trips/user');
      setTrips(response.data);
    } catch (error) {
      console.error('Failed to fetch trips:', error);
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
        tripId: formData.tripId ? parseInt(formData.tripId) : null,
        category: formData.category,
        amount: parseFloat(formData.amount),
        notes: formData.notes || null,
        date: formData.date,
      };

      if (editingBudget) {
        await api.put(`/budget/${editingBudget.id}`, payload);
        showToast('Budget updated successfully');
      } else {
        await api.post('/budget', payload);
        showToast('Expense added successfully');
      }

      setShowForm(false);
      setEditingBudget(null);
      resetForm();
      fetchBudgets();
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to save expense', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setFormData({
      tripId: budget.tripId || '',
      category: budget.category,
      amount: budget.amount,
      notes: budget.notes || '',
      date: budget.date,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    try {
      await api.delete(`/budget/${id}`);
      showToast('Expense deleted successfully');
      fetchBudgets();
    } catch (error) {
      showToast(error.response?.data?.error || 'Failed to delete expense', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      tripId: '',
      category: '',
      amount: '',
      notes: '',
      date: '',
    });
  };

  // Calculate category totals
  const categoryTotals = budgets.reduce((acc, budget) => {
    acc[budget.category] = (acc[budget.category] || 0) + budget.amount;
    return acc;
  }, {});

  const chartData = Object.entries(categoryTotals).map(([category, amount]) => ({
    category,
    amount: parseFloat(amount.toFixed(2)),
  }));

  // Calculate totals per trip
  const tripTotals = budgets.reduce((acc, budget) => {
    const tripId = budget.tripId || 'No Trip';
    acc[tripId] = (acc[tripId] || 0) + budget.amount;
    return acc;
  }, {});

  const getTripName = (tripId) => {
    if (!tripId) return 'No Trip';
    const trip = trips.find((t) => t.id === tripId);
    return trip ? trip.destination : `Trip ${tripId}`;
  };

  return (
    <div>
      <Navbar />
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>Budget Planner</h1>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingBudget(null);
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
            Add Expense
          </button>
        </div>

        {showForm && (
          <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
            <h2>{editingBudget ? 'Edit Expense' : 'Add New Expense'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Trip (optional):</label>
                <select
                  value={formData.tripId}
                  onChange={(e) => setFormData({ ...formData, tripId: e.target.value })}
                  style={{ width: '100%', padding: '8px' }}
                >
                  <option value="">No Trip</option>
                  {trips.map((trip) => (
                    <option key={trip.id} value={trip.id}>
                      {trip.destination}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Category:</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px' }}
                  placeholder="e.g., Food, Transport, Accommodation"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Amount:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    style={{ width: '100%', padding: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Date:</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    style={{ width: '100%', padding: '8px' }}
                  />
                </div>
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
                  {loading ? 'Saving...' : editingBudget ? 'Update' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingBudget(null);
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
          <div>
            <h2>Expenses by Category</h2>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="amount" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p>No expenses to display</p>
            )}
          </div>
          <div>
            <h2>Total by Trip</h2>
            {Object.entries(tripTotals).map(([tripId, total]) => (
              <div
                key={tripId}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  padding: '15px',
                  marginBottom: '10px',
                }}
              >
                <strong>{getTripName(parseInt(tripId) || null)}</strong>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#007bff' }}>
                  ${total.toFixed(2)}
                </p>
              </div>
            ))}
            {Object.keys(tripTotals).length === 0 && <p>No expenses yet</p>}
          </div>
        </div>

        <div>
          <h2>All Expenses</h2>
          {budgets.length === 0 ? (
            <p>No expenses yet. Add your first expense!</p>
          ) : (
            <div>
              {budgets.map((budget) => (
                <div
                  key={budget.id}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    padding: '15px',
                    marginBottom: '15px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3>{budget.category}</h3>
                      <p>${budget.amount.toFixed(2)}</p>
                      <p>{new Date(budget.date).toLocaleDateString()}</p>
                      {budget.tripId && <p>Trip: {getTripName(budget.tripId)}</p>}
                      {budget.notes && <p>{budget.notes}</p>}
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => handleEdit(budget)}
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
                        onClick={() => handleDelete(budget.id)}
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default BudgetPlanner;

