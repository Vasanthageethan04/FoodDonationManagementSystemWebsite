import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Gift, Clock, CheckCircle, AlertTriangle, Eye, HelpCircle } from 'lucide-react';

const DonorDashboard = () => {
  const [data, setData] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState(null);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/Dashboard');
      setData(response.data);
    } catch (error) {
      console.error('Failed to load donor dashboard metrics', error);
    }
  };

  const fetchDonations = async () => {
    try {
      const response = await api.get('/FoodDonations');
      setDonations(response.data);
    } catch (error) {
      console.error('Failed to load donations history', error);
    }
  };

  const handleCancelDonation = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this donation?')) return;
    try {
      await api.patch(`/FoodDonations/${id}/status`, 'Cancelled');
      alert('Donation cancelled successfully.');
      fetchDonations();
      fetchDashboard();
      setSelectedDonation(null);
    } catch (error) {
      alert('Failed to cancel donation');
    }
  };

  useEffect(() => {
    Promise.all([fetchDashboard(), fetchDonations()]).finally(() => setLoading(false));
  }, []);

  const getStepActiveIndex = (status) => {
    switch (status) {
      case 'Pending': return 0;
      case 'Approved': return 1;
      case 'Assigned': return 2;
      case 'Picked Up': return 3;
      case 'Completed': return 4;
      default: return -1;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending': return 'badge badge-pending';
      case 'Approved': return 'badge badge-approved';
      case 'Assigned': return 'badge badge-assigned';
      case 'Completed': return 'badge badge-completed';
      case 'Rejected': return 'badge badge-danger';
      case 'Cancelled': return 'badge badge-danger';
      default: return 'badge';
    }
  };

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading Dashboard...</div>;

  const stats = data?.stats || {};
  const activeStep = selectedDonation ? getStepActiveIndex(selectedDonation.status) : -1;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', color: '#fff' }}>Donor Dashboard</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Keep track of your active donations and meal distributions</p>
      </div>

      {/* Stats Counter */}
      <div className="metrics-grid">
        <div className="glass-card metric-card">
          <div className="metric-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Gift size={22} />
          </div>
          <div className="metric-info">
            <p>Total Donations</p>
            <h3>{stats.totalDonations}</h3>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)' }}>
            <Clock size={22} />
          </div>
          <div className="metric-info">
            <p>Pending Approval</p>
            <h3>{stats.pendingDonations}</h3>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
            <CheckCircle size={22} />
          </div>
          <div className="metric-info">
            <p>Approved / Active</p>
            <h3>{stats.acceptedDonations}</h3>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <CheckCircle size={22} />
          </div>
          <div className="metric-info">
            <p>Completed Deliveries</p>
            <h3>{stats.completedDonations}</h3>
          </div>
        </div>
      </div>

      {/* Main Track Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedDonation ? '3fr 2fr' : '1fr', gap: '30px', transition: 'var(--transition)' }}>
        
        {/* Donations Log */}
        <div className="glass-card" style={{ height: 'fit-content' }}>
          <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: '20px' }}>Donation Listings</h3>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Food Item</th>
                  <th>Quantity</th>
                  <th>Meals</th>
                  <th>Expiry Date/Time</th>
                  <th>Status</th>
                  <th>Track</th>
                </tr>
              </thead>
              <tbody>
                {donations.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>You haven't created any donations yet. Click 'Donate Food' to begin!</td>
                  </tr>
                ) : (
                  donations.map((d) => (
                    <tr key={d.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedDonation(d)}>
                      <td style={{ fontWeight: '600' }}>{d.foodName}</td>
                      <td>{d.quantity}</td>
                      <td>{d.mealsCount} meals</td>
                      <td>{new Date(d.expiryTime).toLocaleString()}</td>
                      <td>
                        <span className={getStatusBadge(d.status)}>
                          {d.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedDonation(d); }}
                          className="btn btn-secondary" 
                          style={{ padding: '6px 12px', fontSize: '11px' }}
                        >
                          <Eye size={12} />
                          Track
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dynamic Tracker Side Panel */}
        {selectedDonation && (
          <div className="glass-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', color: '#fff' }}>Donation Tracker</h3>
              <button 
                onClick={() => setSelectedDonation(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px' }}
              >
                Close
              </button>
            </div>

            {/* Steps Visualizer */}
            {activeStep >= 0 ? (
              <div className="stepper" style={{ marginTop: '10px' }}>
                <div className={`step ${activeStep >= 0 ? 'completed' : ''} ${activeStep === 0 ? 'active' : ''}`}>
                  <div className="step-icon">1</div>
                  <span className="step-label">Pending</span>
                </div>
                <div className={`step ${activeStep >= 1 ? 'completed' : ''} ${activeStep === 1 ? 'active' : ''}`}>
                  <div className="step-icon">2</div>
                  <span className="step-label">Approved</span>
                </div>
                <div className={`step ${activeStep >= 2 ? 'completed' : ''} ${activeStep === 2 ? 'active' : ''}`}>
                  <div className="step-icon">3</div>
                  <span className="step-label">Claimed</span>
                </div>
                <div className={`step ${activeStep >= 3 ? 'completed' : ''} ${activeStep === 3 ? 'active' : ''}`}>
                  <div className="step-icon">4</div>
                  <span className="step-label">Transit</span>
                </div>
                <div className={`step ${activeStep >= 4 ? 'completed' : ''} ${activeStep === 4 ? 'active' : ''}`}>
                  <div className="step-icon">5</div>
                  <span className="step-label">Delivered</span>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <span style={{ fontSize: '13px', color: '#f87171', fontWeight: 'bold' }}>
                  This donation listing has been {selectedDonation.status}
                </span>
              </div>
            )}

            {/* Donation Quick Summary Card */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Item Name:</span>
                <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff' }}>{selectedDonation.foodName}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Meals:</span>
                  <div style={{ color: '#fff' }}>{selectedDonation.mealsCount} meals</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Quantity:</span>
                  <div style={{ color: '#fff' }}>{selectedDonation.quantity}</div>
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Pickup Address:</span>
                <div style={{ color: '#fff' }}>{selectedDonation.pickupAddress}</div>
              </div>
            </div>

            {/* Action buttons (e.g. cancel) */}
            {(selectedDonation.status === 'Pending' || selectedDonation.status === 'Approved') && (
              <button 
                onClick={() => handleCancelDonation(selectedDonation.id)}
                className="btn btn-danger"
                style={{ width: '100%', marginTop: '10px' }}
              >
                Cancel Donation
              </button>
            )}

          </div>
        )}

      </div>

    </div>
  );
};

export default DonorDashboard;
