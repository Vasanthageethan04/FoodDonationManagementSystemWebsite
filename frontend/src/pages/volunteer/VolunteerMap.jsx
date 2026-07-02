import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import MapMock from '../../components/MapMock';

const VolunteerMap = () => {
  const [activeDelivery, setActiveDelivery] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchActive = async () => {
    try {
      const response = await api.get('/Deliveries');
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Find the first delivery assigned to me that is NOT completed
      const active = response.data.find(
        d => d.volunteerId === user.profileSpecificId && d.deliveryStatus !== 'Completed'
      );
      setActiveDelivery(active || null);
    } catch (error) {
      console.error('Failed to load active delivery map coordinates', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActive();
  }, []);

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading Navigation Maps...</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', color: '#fff' }}>Live Routes Navigation</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Display active delivery route tracking information</p>
      </div>

      {activeDelivery ? (
        <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <MapMock 
            pickupAddress={activeDelivery.pickupAddress}
            dropAddress={activeDelivery.dropAddress}
            status={activeDelivery.deliveryStatus}
          />
        </div>
      ) : (
        <div className="glass-card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          No active delivery route transit at the moment. Claim a delivery on the Dashboard to start navigation!
        </div>
      )}

    </div>
  );
};

export default VolunteerMap;
