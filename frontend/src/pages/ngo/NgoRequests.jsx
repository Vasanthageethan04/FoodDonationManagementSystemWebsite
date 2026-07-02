import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Truck, Calendar, MessageSquare, AlertCircle, X, ChevronRight } from 'lucide-react';

const NgoRequests = () => {
  const [requests, setRequests] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [activeDelivery, setActiveDelivery] = useState(null);

  const fetchData = async () => {
    try {
      const requestsRes = await api.get('/Requests');
      setRequests(requestsRes.data);
      
      const deliveriesRes = await api.get('/Deliveries');
      setDeliveries(deliveriesRes.data);
    } catch (error) {
      console.error('Failed to load NGO claims history', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCancelClaim = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this food request?')) return;
    try {
      await api.post(`/Requests/${id}/cancel`);
      alert('Claim cancelled successfully. Food has been released.');
      fetchData();
      setSelectedRequest(null);
      setActiveDelivery(null);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel claim');
    }
  };

  // Find associated delivery for a claim
  const handleSelectRequest = (req) => {
    setSelectedRequest(req);
    // Find delivery where foodDonationId matching
    const del = deliveries.find(d => d.foodDonationId === req.foodDonationId);
    setActiveDelivery(del || null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending': return 'badge badge-pending';
      case 'Approved': return 'badge badge-approved';
      case 'Assigned': return 'badge badge-assigned';
      case 'Completed': return 'badge badge-completed';
      case 'Cancelled': return 'badge badge-danger';
      default: return 'badge';
    }
  };

  const getDeliveryStatusBadge = (status) => {
    switch (status) {
      case 'Assigned': return 'badge badge-pending';
      case 'Accepted': return 'badge badge-approved';
      case 'On the Way': return 'badge badge-assigned';
      case 'Picked Up': return 'badge badge-assigned';
      case 'Completed': return 'badge badge-completed';
      default: return 'badge';
    }
  };

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading Claims History...</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', color: '#fff' }}>My Food Claims</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Track claimed food details, volunteer assignments, and delivery transit state</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedRequest ? '3fr 2fr' : '1fr', gap: '30px', transition: 'var(--transition)' }}>
        
        {/* Claims Table */}
        <div className="glass-card table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Food Item</th>
                <th>Meals</th>
                <th>Quantity</th>
                <th>Claim Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>You haven't claimed any food allocations yet.</td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => handleSelectRequest(r)}>
                    <td style={{ fontWeight: '600' }}>{r.foodName}</td>
                    <td>{r.mealsCount} meals</td>
                    <td>{r.quantity}</td>
                    <td>{new Date(r.requestDate).toLocaleDateString()}</td>
                    <td>
                      <span className={getStatusBadge(r.requestStatus)}>
                        {r.requestStatus}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleSelectRequest(r); }}
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

        {/* Claim Delivery Tracking Sidebar */}
        {selectedRequest && (
          <div className="glass-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', color: '#fff' }}>Claim Tracking</h3>
              <button 
                onClick={() => { setSelectedRequest(null); setActiveDelivery(null); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px' }}
              >
                Close
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Food Item:</span>
                <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', marginTop: '2px' }}>{selectedRequest.foodName}</div>
              </div>

              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Logistics Address:</span>
                <div style={{ color: '#fff', marginTop: '2px' }}>{selectedRequest.pickupAddress}</div>
              </div>

              <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '12px' }}>
                <h4 style={{ fontSize: '14px', color: '#fff', marginBottom: '8px' }}>Delivery Details</h4>
                {activeDelivery ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Transit Status:</span>
                      <span className={getDeliveryStatusBadge(activeDelivery.deliveryStatus)}>
                        {activeDelivery.deliveryStatus}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Assigned Volunteer:</span>
                      <span style={{ color: '#fff', fontWeight: '600' }}>
                        {activeDelivery.volunteerName || 'Waiting to be accepted...'}
                      </span>
                    </div>

                    {activeDelivery.estimatedTime && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Estimated ETA:</span>
                        <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{activeDelivery.estimatedTime}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ padding: '8px 12px', background: 'rgba(245, 158, 11, 0.08)', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.2)', display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <AlertCircle size={14} style={{ color: 'var(--warning)' }} />
                    <span style={{ fontSize: '11px', color: 'var(--warning)' }}>No delivery ticket found.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Cancel Claim button if not completed/cancelled */}
            {selectedRequest.requestStatus === 'Approved' && (!activeDelivery || activeDelivery.deliveryStatus === 'Assigned' || activeDelivery.deliveryStatus === 'Accepted') && (
              <button 
                onClick={() => handleCancelClaim(selectedRequest.id)}
                className="btn btn-danger"
                style={{ width: '100%', marginTop: '20px' }}
              >
                Cancel Claims
              </button>
            )}

          </div>
        )}

      </div>

    </div>
  );
};

export default NgoRequests;
