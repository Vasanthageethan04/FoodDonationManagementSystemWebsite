import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  FolderHeart, 
  HeartHandshake, 
  FileText, 
  User, 
  Bell, 
  LogOut, 
  Map, 
  Gift, 
  Truck, 
  Search,
  MessageCircle
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const role = user.role || 'Donor';

  // Render navigation links based on user role
  const getNavLinks = () => {
    switch (role) {
      case 'Admin':
        return [
          { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
          { path: '/admin/users', label: 'Users Management', icon: Users },
          { path: '/admin/categories', label: 'Categories', icon: FolderHeart },
          { path: '/admin/donations', label: 'Monitoring', icon: HeartHandshake },
          { path: '/admin/reports', label: 'System Reports', icon: FileText },
        ];
      case 'Donor':
        return [
          { path: '/donor', label: 'Dashboard', icon: LayoutDashboard },
          { path: '/donor/create', label: 'Donate Food', icon: Gift },
          { path: '/donor/history', label: 'My Donations', icon: HeartHandshake },
        ];
      case 'NGO':
        return [
          { path: '/ngo', label: 'Dashboard', icon: LayoutDashboard },
          { path: '/ngo/browse', label: 'Browse Food', icon: Search },
          { path: '/ngo/requests', label: 'My Claims', icon: FileText },
        ];
      case 'Volunteer':
        return [
          { path: '/volunteer', label: 'Dashboard', icon: LayoutDashboard },
          { path: '/volunteer/deliveries', label: 'My Deliveries', icon: Truck },
          { path: '/volunteer/map', label: 'Live Maps', icon: Map },
        ];
      default:
        return [];
    }
  };

  const links = getNavLinks();

  return (
    <aside className="sidebar">
      {/* Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px', padding: '0 8px' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
          width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
        }}>
          <HeartHandshake size={20} />
        </div>
        <span style={{ fontSize: '18px', fontWeight: 'bold', fontFamily: 'var(--font-title)', color: '#fff' }}>
          ShareMeal
        </span>
      </div>

      {/* Nav List */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              end
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                background: isActive ? 'var(--primary-light)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: isActive ? '600' : '400',
                transition: 'var(--transition)',
              })}
            >
              <Icon size={18} />
              {link.label}
            </NavLink>
          );
        })}
      </nav>

      {/* User Session Info / Logout */}
      <div style={{ 
        borderTop: '1px solid var(--glass-border)', 
        paddingTop: '20px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 8px' }}>
          <div style={{ 
            width: '36px', 
            height: '36px', 
            borderRadius: '50%', 
            background: 'var(--bg-tertiary)', 
            display: 'flex', 
            alignItems: 'center', 
            justify: 'center', 
            border: '1px solid var(--glass-border)' 
          }}>
            <User size={16} style={{ margin: 'auto' }} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {user.username}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              {role}
            </div>
          </div>
        </div>

        <button 
          onClick={logout}
          className="btn btn-secondary"
          style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
