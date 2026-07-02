import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { LayoutDashboard, ShoppingBag, FolderSync, CheckSquare } from 'lucide-react';

const NgoDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await api.get('/Dashboard');
      setData(response.data);
    } catch (error) {
      console.error('Failed to load NGO dashboard stats', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading Dashboard...</div>;

  const stats = data?.stats || {};

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', color: '#fff' }}>NGO Dashboard</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Claim available food donations and coordinate distribution logistics</p>
      </div>

      {/* Metrics Counters */}
      <div className="metrics-grid">
        <div className="glass-card metric-card">
          <div className="metric-icon" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
            <ShoppingBag size={22} />
          </div>
          <div className="metric-info">
            <p>Available Food Nearby</p>
            <h3>{stats.nearbyDonations}</h3>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <CheckSquare size={22} />
          </div>
          <div className="metric-info">
            <p>Total Claims Filled</p>
            <h3>{stats.acceptedDonations}</h3>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)' }}>
            <FolderSync size={22} />
          </div>
          <div className="metric-info">
            <p>Pending Claims</p>
            <h3>{stats.pendingRequests}</h3>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <CheckSquare size={22} />
          </div>
          <div className="metric-info">
            <p>Completed Deliveries</p>
            <h3>{stats.completedDeliveries}</h3>
          </div>
        </div>
      </div>

      {/* Instructions / Dashboard Details */}
      <div className="glass-card">
        <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '12px' }}>How to Claim Food:</h3>
        <ul style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.8', paddingLeft: '20px' }}>
          <li>Go to the <strong>Browse Food</strong> section to view all available listings approved by our Admins.</li>
          <li>Search and filter by food type (Vegetarian / Non-Vegetarian) or food category.</li>
          <li>Click <strong>Claim Allocation</strong> on a listing, enter a delivery note, and submit.</li>
          <li>An automatic delivery ticket will be registered, allowing active Volunteers to accept the task.</li>
          <li>Track the delivery in real-time under the <strong>My Claims</strong> tab.</li>
        </ul>
      </div>

    </div>
  );
};

export default NgoDashboard;
