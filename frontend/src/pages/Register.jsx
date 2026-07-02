import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Lock, Mail, User, Phone, MapPin, Building, AlertCircle } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  // Basic Account Credentials State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState(2); // 2 = Donor, 3 = NGO, 4 = Volunteer

  // Profile Specific State
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');
  const [state, setState] = useState('Delhi');
  const [district, setDistrict] = useState('New Delhi');
  const [city, setCity] = useState('Delhi');
  const [area, setArea] = useState('');
  const [pincode, setPincode] = useState('');

  // NGO Specific
  const [orgName, setOrgName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');

  // Volunteer Specific
  const [vehicleType, setVehicleType] = useState('Bike');

  // Error/Status State
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      username,
      email,
      password,
      roleId,
      contactNumber,
      address,
      state,
      district,
      city,
      area,
      pincode,
      orgName: roleId === 3 ? orgName : '',
      registrationNumber: roleId === 3 ? registrationNumber : '',
      vehicleType: roleId === 4 ? vehicleType : ''
    };

    try {
      await register(payload);
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '640px', padding: '40px' }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
            width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
            margin: '0 auto 16px auto'
          }}>
            <Heart size={22} fill="white" />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff' }}>Join ShareMeal</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' }}>Register to donate, claim, or coordinate food distribution</p>
        </div>

        {/* Error Notification Banner */}
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

        {/* Registration Form */}
        <form onSubmit={handleSubmit}>
          
          {/* STEP 1: SELECT ROLE */}
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Register As</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <button 
                type="button" 
                className={`btn ${roleId === 2 ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '12px' }}
                onClick={() => setRoleId(2)}
              >
                Food Donor
              </button>
              <button 
                type="button" 
                className={`btn ${roleId === 3 ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '12px' }}
                onClick={() => setRoleId(3)}
              >
                NGO Partner
              </button>
              <button 
                type="button" 
                className={`btn ${roleId === 4 ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '12px' }}
                onClick={() => setRoleId(4)}
              >
                Volunteer
              </button>
            </div>
          </div>

          {/* STEP 2: CREDENTIALS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Username</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ paddingLeft: '45px' }}
                  placeholder="john_doe" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
                <input 
                  type="email" 
                  className="form-input" 
                  style={{ paddingLeft: '45px' }}
                  placeholder="john@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Password</label>
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

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Contact Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
                <input 
                  type="tel" 
                  className="form-input" 
                  style={{ paddingLeft: '45px' }}
                  placeholder="9876543210" 
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* STEP 3: DYNAMIC PROFILE INPUTS */}
          {roleId === 3 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px', animation: 'fadeIn 0.3s ease' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">NGO Organization Name</label>
                <div style={{ position: 'relative' }}>
                  <Building size={16} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ paddingLeft: '45px' }}
                    placeholder="Feed India Trust" 
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    required={roleId === 3}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">NGO Registration Number</label>
                <div style={{ position: 'relative' }}>
                  <Building size={16} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ paddingLeft: '45px' }}
                    placeholder="NGO-12345/ABC" 
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    required={roleId === 3}
                  />
                </div>
              </div>
            </div>
          )}

          {roleId === 4 && (
            <div className="form-group" style={{ animation: 'fadeIn 0.3s ease' }}>
              <label className="form-label">Vehicle Type for Deliveries</label>
              <select 
                className="form-input" 
                value={vehicleType} 
                onChange={(e) => setVehicleType(e.target.value)}
              >
                <option value="Bike">Motorcycle / Scooter</option>
                <option value="Car">Car</option>
                <option value="Van">Delivery Van</option>
                <option value="Walking">Walking / Bicycle</option>
              </select>
            </div>
          )}

          {/* STEP 4: LOCATION / ADDRESS */}
          <div className="form-group">
            <label className="form-label">Complete Street Address</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={16} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="form-input" 
                style={{ paddingLeft: '45px' }}
                placeholder="Flat 101, block B, Connaught Place" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '24px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Area/Locality</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Central Market" 
                value={area}
                onChange={(e) => setArea(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">City</label>
              <input 
                type="text" 
                className="form-input" 
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Pincode</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="110001" 
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
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
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
