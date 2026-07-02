import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Truck, CheckCircle, Navigation, ShieldCheck } from 'lucide-react';

const VolunteerDashboard = () => {
  const [data, setData] = useState(null);
  const [availableDeliveries, setAvailableDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/Dashboard');
      setData(response.data);
    } catch (error) {
      console.error('Failed to load volunteer metrics', error);
    }
  };

  const fetchAvailable = async () => {
    try {
      const response = await api.get('/Deliveries');
      // Filter unclaimed deliveries
      const unclaimed = response.data.filter(d => d.volunteerId === null);
      setAvailableDeliveries(unclaimed);
    } catch (error) {
      console.error('Failed to load available deliveries', error);
    }
  };

  useEffect(() => {
    Promise.all([fetchDashboard(), fetchAvailable()]).finally(() => setLoading(false));
  }, []);

  const handleClaimDelivery = async (id) => {
    try {
      await api.post(`/Deliveries/${id}/accept`);
      alert('Delivery accepted successfully! Navigate to My Deliveries to update status.');
      fetchDashboard();
      fetchAvailable();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to claim delivery');
    }
  };

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading Dashboard...</div>;

  const stats = data?.stats || {};

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', color: '#fff' }}>Volunteer Dashboard</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Claim delivery tickets, navigate routes, and help distribute food package resources</p>
      </div>

      {/* Metrics Counter */}
      <div className="metrics-grid">
        <div className="glass-card metric-card">
          <div className="metric-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
            <Truck size={22} />
          </div>
          <div className="metric-info">
            <p>Active Transit Tasks</p>
            <h3>{stats.assignedDeliveries}</h3>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <CheckCircle size={22} />
          </div>
          <div className="metric-info">
            <p>Completed Deliveries</p>
            <h3>{stats.completedDeliveries}</h3>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)' }}>
            <Navigation size={22} />
          </div>
          <div className="metric-info">
            <p>Pending Pickups</p>
            <h3>{stats.pendingPickups}</h3>
          </div>
        </div>
      </div>

      {/* Available Jobs list */}
      <div className="glass-card">
        <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Truck size={18} style={{ color: 'var(--primary)' }} />
          Available Delivery Boards (Unclaimed)
        </h3>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Food Item</th>
                <th>Meals</th>
                <th>Pickup Location</th>
                <th>Drop NGO Location</th>
                <th>Estimated Route Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {availableDeliveries.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '24px 0' }}>
                    All caught up! No unclaimed delivery tickets currently in the queue.
                  </td>
                </tr>
              ) : (
                availableDeliveries.map((job) => (
                  <tr key={job.id}>
                    <td style={{ fontWeight: '600' }}>{job.foodName}</td>
                    <td>{job.mealsCount} meals</td>
                    <td>{job.pickupAddress}</td>
                    <td>{job.ngoName} ({job.dropAddress})</td>
                    <td>{job.estimatedTime || '18 mins'}</td>
                    <td>
                      <button 
                        onClick={() => handleClaimDelivery(job.id)}
                        className="btn btn-primary"
                        style={{ padding: '6px 12px', fontSize: '11px' }}
                      >
                        Claim Route
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default VolunteerDashboard;
