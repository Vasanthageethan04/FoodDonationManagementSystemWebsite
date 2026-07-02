import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Check, X, ShieldAlert, Heart, Calendar } from 'lucide-react';

const DonationsMonitoring = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState(null);

  const fetchDonations = async () => {
    try {
      const response = await api.get('/FoodDonations');
      setDonations(response.data);
    } catch (error) {
      console.error('Failed to load donations', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.patch(`/FoodDonations/${id}/status`, status);
      alert(`Donation status updated to ${status}`);
      setSelectedDonation(null);
      fetchDonations();
    } catch (error) {
      alert('Failed to update donation status');
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

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading Donations...</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', color: '#fff' }}>Donation Monitoring</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Approve, reject, and track donation packages submitted by donors</p>
      </div>

      {/* Monitor Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedDonation ? '3fr 2fr' : '1fr', gap: '30px', transition: 'var(--transition)' }}>
        
        {/* Donation Table List */}
        <div className="glass-card table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Food Name</th>
                <th>Donor</th>
                <th>Category</th>
                <th>Meals</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((d) => (
                <tr key={d.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedDonation(d)}>
                  <td style={{ fontWeight: '600' }}>{d.foodName}</td>
                  <td>{d.donorName}</td>
                  <td>{d.categoryName}</td>
                  <td>{d.mealsCount} meals</td>
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
                      Monitor
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Selected Donation Detailed Action panel */}
        {selectedDonation && (
          <div className="glass-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '18px', color: '#fff' }}>Donation Details</h3>
              <button 
                onClick={() => setSelectedDonation(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                Close Panel
              </button>
            </div>

            {/* Photo preview */}
            {selectedDonation.images && selectedDonation.images.length > 0 && (
              <img 
                src={selectedDonation.images[0]} 
                alt={selectedDonation.foodName}
                style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
              />
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Food Item:</span>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', marginTop: '2px' }}>{selectedDonation.foodName}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Quantity:</span>
                  <div style={{ fontWeight: '600', color: '#fff' }}>{selectedDonation.quantity}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Meals Count:</span>
                  <div style={{ fontWeight: '600', color: '#fff' }}>{selectedDonation.mealsCount} meals</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Type:</span>
                  <div style={{ fontWeight: '600', color: '#fff' }}>{selectedDonation.foodType}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Storage:</span>
                  <div style={{ fontWeight: '600', color: '#fff' }}>{selectedDonation.storageType}</div>
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Pickup Location Address:</span>
                <div style={{ color: '#fff', marginTop: '2px' }}>{selectedDonation.pickupAddress}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Cooking Date:</span>
                  <div style={{ color: '#fff' }}>{new Date(selectedDonation.cookingDate).toLocaleDateString()}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Expiry Time:</span>
                  <div style={{ color: 'var(--danger)', fontWeight: '600' }}>
                    {new Date(selectedDonation.expiryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              {selectedDonation.description && (
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Description:</span>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px', lineHeight: '1.4' }}>{selectedDonation.description}</p>
                </div>
              )}
            </div>

            {/* Approval Decision Buttons */}
            {selectedDonation.status === 'Pending' && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
                <button 
                  onClick={() => handleUpdateStatus(selectedDonation.id, 'Approved')}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  <Check size={16} />
                  Approve Food
                </button>
                <button 
                  onClick={() => handleUpdateStatus(selectedDonation.id, 'Rejected')}
                  className="btn btn-danger"
                  style={{ flex: 1 }}
                >
                  <X size={16} />
                  Reject listing
                </button>
              </div>
            )}
            
            {selectedDonation.status !== 'Pending' && (
              <div style={{ marginTop: '20px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '4px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  This listing is currently in status: <strong>{selectedDonation.status}</strong>
                </span>
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
};

export default DonationsMonitoring;
