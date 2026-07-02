import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Bell, User, Check, ShieldAlert } from 'lucide-react';

const Navbar = () => {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);

  if (!user) return null;

  const role = user.role || 'Donor';

  const getRoleBadgeClass = () => {
    switch (role) {
      case 'Admin': return 'badge badge-danger';
      case 'Donor': return 'badge badge-active';
      case 'NGO': return 'badge badge-approved';
      case 'Volunteer': return 'badge badge-assigned';
      default: return 'badge';
    }
  };

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 40px',
      borderBottom: '1px solid var(--glass-border)',
      background: 'rgba(11, 15, 25, 0.4)',
      backdropFilter: 'blur(10px)',
      position: 'sticky',
      top: 0,
      zIndex: 90,
      width: '100%'
    }}>
      {/* Search Bar Placeholder or Title */}
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: '600' }}>
          Welcome back, <span style={{ color: 'var(--primary)' }}>{user.displayName || user.username}</span>!
        </h2>
      </div>

      {/* Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative' }}>
        
        {/* Role Badge */}
        <span className={getRoleBadgeClass()} style={{ textTransform: 'uppercase', padding: '6px 12px' }}>
          {role}
        </span>

        {/* Notifications Icon with Badge */}
        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowNotifications(!showNotifications)}>
          <div style={{ 
            padding: '8px', 
            background: 'var(--bg-secondary)', 
            border: '1px solid var(--glass-border)', 
            borderRadius: '50%',
            color: 'var(--text-primary)',
            transition: 'var(--transition)'
          }}>
            <Bell size={18} />
          </div>

          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              background: 'var(--danger)',
              color: 'white',
              fontSize: '9px',
              fontWeight: 'bold',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 8px rgba(239, 68, 68, 0.5)'
            }}>
              {unreadCount}
            </span>
          )}
        </div>

        {/* Notifications Dropdown Card */}
        {showNotifications && (
          <div className="glass-card" style={{
            position: 'absolute',
            top: '50px',
            right: 0,
            width: '320px',
            maxHeight: '400px',
            overflowY: 'auto',
            zIndex: 110,
            padding: '16px',
            animation: 'fadeIn 0.2s ease forwards'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 'bold' }}>Notifications</h4>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}
                >
                  Mark all read
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  No notifications yet.
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id} 
                    onClick={() => !n.isRead && markAsRead(n.id)}
                    style={{
                      padding: '10px',
                      borderRadius: 'var(--radius-sm)',
                      background: n.isRead ? 'transparent' : 'rgba(255, 255, 255, 0.03)',
                      borderLeft: n.isRead ? '3px solid transparent' : '3px solid var(--primary)',
                      cursor: 'pointer',
                      transition: 'var(--transition)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontSize: '13px', fontWeight: n.isRead ? '500' : '600', color: '#fff' }}>{n.title}</div>
                      {!n.isRead && <Check size={14} style={{ color: 'var(--primary)' }} />}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>{n.message}</div>
                    <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '6px' }}>
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
