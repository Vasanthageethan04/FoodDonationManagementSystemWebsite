import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Truck, Check, Eye, Navigation, AlertCircle } from 'lucide-react';
import MapMock from '../../components/MapMock';

const VolunteerDeliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState(null);

  const fetchDeliveries = async () => {
    try {
      const response = await api.get('/Deliveries');
      // Filter only deliveries assigned to me
      const user = JSON.parse(localStorage.getItem('user'));
      const myDeliveries = response.data.filter(d => d.volunteerId === user.profileSpecificId);
      setDeliveries(myDeliveries);
    } catch (error) {
      console.error('Failed to load volunteer deliveries', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/Deliveries/${id}/status`, newStatus);
      alert(`Status updated to ${newStatus}`);
      fetchDeliveries();
      // Update selected delivery details
      setSelectedDelivery((prev) => prev ? { ...prev, deliveryStatus: newStatus } : null);
    } catch (error) {
      alert('Failed to update delivery status');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Assigned': return 'badge badge-pending';
      case 'Accepted': return 'badge badge-approved';
      case 'On the Way': return 'badge badge-assigned';
      case 'Picked Up': return 'badge badge-assigned';
      case 'Completed': return 'badge badge-completed';
      default: return 'badge';
    }
  };

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading Deliveries...</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', color: '#fff' }}>My Delivery Jobs</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Update delivery status steps and view maps routing for accepted claims</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedDelivery ? '1fr 1fr' : '1fr', gap: '30px', transition: 'var(--transition)' }}>
        
        {/* Deliveries list */}
        <div className="glass-card" style={{ height: 'fit-content' }}>
          <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: '20px' }}>Assigned Delivery Tickets</h3>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Food Item</th>
                  <th>Pickup Address</th>
                  <th>Drop NGO</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>You haven't claimed any active deliveries yet. Explore the Dashboard to claim one!</td>
                  </tr>
                ) : (
                  deliveries.map((del) => (
                    <tr key={del.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedDelivery(del)}>
                      <td style={{ fontWeight: '600' }}>{del.foodName}</td>
                      <td>{del.pickupAddress}</td>
                      <td>{del.ngoName}</td>
                      <td>
                        <span className={getStatusBadge(del.deliveryStatus)}>
                          {del.deliveryStatus}
                        </span>
                      </td>
                      <td>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedDelivery(del); }}
                          className="btn btn-secondary" 
                          style={{ padding: '6px 12px', fontSize: '11px' }}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Delivery Details & Map Routing */}
        {selectedDelivery && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* Live routing map mock */}
            <MapMock 
              pickupAddress={selectedDelivery.pickupAddress}
              dropAddress={selectedDelivery.dropAddress}
              status={selectedDelivery.deliveryStatus}
            />

            {/* Stepper details */}
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', color: '#fff' }}>Status Coordinator</h3>
                <button 
                  onClick={() => setSelectedDelivery(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px' }}
                >
                  Close
                </button>
              </div>

              {/* Status Update Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                {selectedDelivery.deliveryStatus === 'Accepted' && (
                  <button 
                    onClick={() => handleUpdateStatus(selectedDelivery.id, 'On the Way')}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                  >
                    Start Transit (On the Way)
                  </button>
                )}

                {selectedDelivery.deliveryStatus === 'On the Way' && (
                  <button 
                    onClick={() => handleUpdateStatus(selectedDelivery.id, 'Picked Up')}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                  >
                    Confirm Package Picked Up
                  </button>
                )}

                {selectedDelivery.deliveryStatus === 'Picked Up' && (
                  <button 
                    onClick={() => handleUpdateStatus(selectedDelivery.id, 'Completed')}
                    className="btn btn-primary"
                    style={{ width: '100%', background: 'var(--success)' }}
                  >
                    Confirm Delivery Completed
                  </button>
                )}

                {selectedDelivery.deliveryStatus === 'Completed' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.2)', color: 'var(--primary)', fontSize: '13px' }}>
                    <Check size={16} />
                    <span>This delivery has been successfully completed. Great job!</span>
                  </div>
                )}

                {/* Additional Contacts */}
                <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-secondary)', borderTop: '1px solid var(--glass-border)', paddingTop: '12px' }}>
                  <div>📞 Donor Contact: <strong>{selectedDelivery.pickupContact}</strong></div>
                  <div style={{ marginTop: '6px' }}>🏢 NGO Contact: <strong>{selectedDelivery.dropContact}</strong></div>
                </div>

              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};

export default VolunteerDeliveries;
