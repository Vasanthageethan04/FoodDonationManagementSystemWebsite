import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Lock, Mail, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      // Route based on role
      const role = loggedUser.role;
      if (role === 'Admin') navigate('/admin');
      else if (role === 'Donor') navigate('/donor');
      else if (role === 'NGO') navigate('/ngo');
      else if (role === 'Volunteer') navigate('/volunteer');
      else navigate('/');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '440px', padding: '40px 30px' }}>
        
        {/* Brand Logo Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
            width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
            margin: '0 auto 16px auto', boxShadow: '0 8px 16px rgba(16, 185, 129, 0.2)'
          }}>
            <Heart size={26} fill="white" />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff' }}>Welcome Back</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' }}>Sign in to continue to ShareMeal</p>
        </div>

        {/* Error Alert Box */}
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

        {/* Login Form */}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
              <Link to="/forgot-password" style={{ color: 'var(--primary)', fontSize: '12px', textDecoration: 'none' }}>
                Forgot Password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                className="form-input" 
                style={{ paddingLeft: '45px' }}
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '12px', fontSize: '15px' }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Footer Link */}
        <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>
            Register Now
          </Link>
        </div>

        {/* Demo Credentials Helper Box */}
        <div style={{ marginTop: '24px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--glass-border)', padding: '14px', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>🔑 Default Admin Account:</div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            <div><strong>Email:</strong> admin@fooddonation.com</div>
            <div style={{ marginTop: '4px' }}><strong>Password:</strong> admin123</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
