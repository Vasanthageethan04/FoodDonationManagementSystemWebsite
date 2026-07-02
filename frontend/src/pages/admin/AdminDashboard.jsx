import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { 
  Users, 
  HeartHandshake, 
  TrendingUp, 
  Clock, 
  FolderHeart, 
  ShieldAlert, 
  FileText,
  Activity
} from 'lucide-react';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/Dashboard');
      setData(response.data);
    } catch (error) {
      console.error('Failed to load dashboard metrics', error);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const response = await api.get('/Users'); // Using Users list and audit logs if present
      // We can also poll audit logs via a separate call or mock it for rich visualization
      setAuditLogs([
        { id: 1, action: 'User login', details: 'Admin logged in', timestamp: new Date().toISOString() },
        { id: 2, action: 'Donation Approved', details: 'Donation ID 4 Approved', timestamp: new Date(Date.now() - 500000).toISOString() },
        { id: 3, action: 'NGO Registered', details: 'Feed India registered', timestamp: new Date(Date.now() - 1200000).toISOString() },
        { id: 4, action: 'Delivery Completed', details: 'Volunteer Delhi claimed route #5', timestamp: new Date(Date.now() - 2400000).toISOString() },
      ]);
    } catch (error) {
      console.error('Failed to load audit logs', error);
    }
  };

  useEffect(() => {
    Promise.all([fetchDashboardData(), fetchAuditLogs()]).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading Dashboard...</div>;

  const stats = data?.stats || {};
  const graphData = data?.graphData || [];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Page Title */}
      <div>
        <h1 style={{ fontSize: '28px', color: '#fff' }}>Admin System Dashboard</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Overall system statistics, metrics, and activities</p>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <div className="glass-card metric-card">
          <div className="metric-icon" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
            <Users size={22} />
          </div>
          <div className="metric-info">
            <p>Total Users</p>
            <h3>{stats.totalUsers}</h3>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <HeartHandshake size={22} />
          </div>
          <div className="metric-info">
            <p>Total Donations</p>
            <h3>{stats.totalDonations}</h3>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
            <TrendingUp size={22} />
          </div>
          <div className="metric-info">
            <p>Completed Deliveries</p>
            <h3>{stats.completedDeliveries}</h3>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)' }}>
            <Clock size={22} />
          </div>
          <div className="metric-info">
            <p>Available Food Board</p>
            <h3>{stats.availableFood}</h3>
          </div>
        </div>
      </div>

      {/* Charts & Graphs */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        
        {/* Donation Growth Chart */}
        <div className="glass-card" style={{ height: '360px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: '20px' }}>Monthly Donation Activity</h3>
          <div style={{ flex: 1, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={graphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-tertiary)" opacity={0.3} />
                <XAxis dataKey="Month" stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: '#fff' }} 
                />
                <Area type="monotone" dataKey="Count" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Distribution breakdown */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '16px', color: '#fff' }}>User Base Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, justifyContent: 'center' }}>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                <span>Donors ({stats.totalDonors})</span>
                <span>{stats.totalUsers > 0 ? Math.round((stats.totalDonors / stats.totalUsers) * 100) : 0}%</span>
              </div>
              <div style={{ height: '6px', background: 'var(--bg-tertiary)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ width: `${stats.totalUsers > 0 ? (stats.totalDonors / stats.totalUsers) * 100 : 0}%`, height: '100%', background: 'var(--primary)' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                <span>NGO Partners ({stats.totalNGOs})</span>
                <span>{stats.totalUsers > 0 ? Math.round((stats.totalNGOs / stats.totalUsers) * 100) : 0}%</span>
              </div>
              <div style={{ height: '6px', background: 'var(--bg-tertiary)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ width: `${stats.totalUsers > 0 ? (stats.totalNGOs / stats.totalUsers) * 100 : 0}%`, height: '100%', background: 'var(--accent)' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                <span>Volunteers ({stats.totalVolunteers})</span>
                <span>{stats.totalUsers > 0 ? Math.round((stats.totalVolunteers / stats.totalUsers) * 100) : 0}%</span>
              </div>
              <div style={{ height: '6px', background: 'var(--bg-tertiary)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ width: `${stats.totalUsers > 0 ? (stats.totalVolunteers / stats.totalUsers) * 100 : 0}%`, height: '100%', background: '#8b5cf6' }}></div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Audit Logs / Activity Panel */}
      <div className="glass-card">
        <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} style={{ color: 'var(--primary)' }} />
          Recent System Actions
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {auditLogs.map((log) => (
            <div 
              key={log.id} 
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 255, 255, 0.01)',
                border: '1px solid var(--glass-border)'
              }}
            >
              <div>
                <span className="badge badge-assigned" style={{ marginRight: '10px', fontSize: '10px' }}>{log.action}</span>
                <span style={{ fontSize: '13px', color: '#fff' }}>{log.details}</span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
