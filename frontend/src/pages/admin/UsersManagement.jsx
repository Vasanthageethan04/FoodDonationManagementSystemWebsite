import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { UserPlus, Edit2, Trash2, Power, Eye, X } from 'lucide-react';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState(2);
  const [isActive, setIsActive] = useState(true);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/Users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/Users', { username, email, password, roleId, isActive });
      alert('User added successfully!');
      setShowAddModal(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add user');
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/Users/${selectedUser.id}`, { 
        username, 
        email, 
        roleId, 
        isActive 
      });
      alert('User updated successfully!');
      setShowEditModal(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.patch(`/Users/${id}/toggle-status`);
      fetchUsers();
    } catch (error) {
      alert('Failed to toggle status');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/Users/${id}`);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setUsername(user.username);
    setEmail(user.email);
    setRoleId(user.roleId);
    setIsActive(user.isActive);
    setShowEditModal(true);
  };

  const resetForm = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setRoleId(2);
    setIsActive(true);
    setSelectedUser(null);
  };

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading Users...</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: '#fff' }}>Users Management</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Manage administrative profiles, NGOs, Volunteers, and Donors</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="btn btn-primary"
        >
          <UserPlus size={18} />
          Add New User
        </button>
      </div>

      {/* Users Table */}
      <div className="glass-card table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`badge ${user.isActive ? 'badge-active' : 'badge-danger'}`}>
                    {user.isActive ? 'Active' : 'Deactivated'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => openEditModal(user)}
                      className="btn btn-secondary" 
                      style={{ padding: '6px' }}
                      title="Edit Profile"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(user.id)}
                      className="btn btn-secondary" 
                      style={{ padding: '6px', color: user.isActive ? 'var(--warning)' : 'var(--primary)' }}
                      title={user.isActive ? 'Deactivate User' : 'Activate User'}
                    >
                      <Power size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user.id)}
                      className="btn btn-secondary" 
                      style={{ padding: '6px', color: 'var(--danger)' }}
                      title="Delete User"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD USER MODAL */}
      {showAddModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '30px', position: 'relative' }}>
            <button 
              onClick={() => setShowAddModal(false)}
              style={{ position: 'absolute', right: '20px', top: '20px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <h3 style={{ marginBottom: '20px', color: '#fff' }}>Add New Account</h3>
            
            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input 
                  type="email" 
                  className="form-input" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input 
                  type="password" 
                  className="form-input" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">User Role</label>
                <select 
                  className="form-input"
                  value={roleId}
                  onChange={(e) => setRoleId(Number(e.target.value))}
                >
                  <option value={2}>Donor</option>
                  <option value={3}>NGO Partner</option>
                  <option value={4}>Volunteer</option>
                  <option value={1}>Administrator</option>
                </select>
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox" 
                  id="isActiveAdd"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <label htmlFor="isActiveAdd" className="form-label" style={{ marginBottom: 0 }}>Activate Profile immediately</label>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                Save Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {showEditModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '30px', position: 'relative' }}>
            <button 
              onClick={() => setShowEditModal(false)}
              style={{ position: 'absolute', right: '20px', top: '20px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <h3 style={{ marginBottom: '20px', color: '#fff' }}>Edit Account details</h3>
            
            <form onSubmit={handleEditUser}>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input 
                  type="email" 
                  className="form-input" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">User Role</label>
                <select 
                  className="form-input"
                  value={roleId}
                  onChange={(e) => setRoleId(Number(e.target.value))}
                >
                  <option value={2}>Donor</option>
                  <option value={3}>NGO Partner</option>
                  <option value={4}>Volunteer</option>
                  <option value={1}>Administrator</option>
                </select>
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox" 
                  id="isActiveEdit"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <label htmlFor="isActiveEdit" className="form-label" style={{ marginBottom: 0 }}>Active Account</label>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                Update Profile
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default UsersManagement;
