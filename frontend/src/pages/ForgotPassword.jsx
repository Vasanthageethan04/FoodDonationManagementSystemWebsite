import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Heart, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/Auth/forgot-password', { email, newPassword });
      setSuccess('Your password has been reset successfully. Redirecting to Login...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Check if email is correct.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '440px', padding: '40px 30px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
            width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
            margin: '0 auto 16px auto'
          }}>
            <Heart size={26} fill="white" />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff' }}>Reset Password</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' }}>Provide your email and a new password to reset it</p>
        </div>

        {/* Banners */}
        {error && (
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'rgba(239, 68, 68, 0.12)', 
            border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 'var(--radius-sm)', color: '#f87171', 
            fontSize: '13px', marginBottom: '20px' 
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'rgba(16, 185, 129, 0.12)', 
            border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-sm)', color: '#34d399', 
            fontSize: '13px', marginBottom: '20px' 
          }}>
            <CheckCircle size={18} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        {/* Reset Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                className="form-input" 
                style={{ paddingLeft: '45px' }}
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">New Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                className="form-input" 
                style={{ paddingLeft: '45px' }}
                placeholder="Enter new password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '12px' }}
            disabled={loading || success}
          >
            {loading ? 'Processing...' : 'Reset Password'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          Remember your password?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
