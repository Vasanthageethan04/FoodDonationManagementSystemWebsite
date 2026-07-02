import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, Gift, Heart, Calendar, Clock, MapPin, X } from 'lucide-react';

const BrowseAvailableFood = () => {
  const [donations, setDonations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search/Filter states
  const [searchText, setSearchText] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [foodType, setFoodType] = useState('');

  // Modal States
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [claimMessage, setClaimMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/Categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories', error);
    }
  };

  const fetchAvailableFood = async () => {
    try {
      const response = await api.get('/FoodDonations', {
        params: {
          search: searchText || undefined,
          categoryId: categoryId || undefined,
          foodType: foodType || undefined
        }
      });
      // NGOs see Approved listings that are unclaimed
      setDonations(response.data);
    } catch (error) {
      console.error('Failed to fetch available food', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchAvailableFood();
  }, [searchText, categoryId, foodType]);

  const handleClaim = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/Requests', {
        foodDonationId: selectedDonation.id,
        message: claimMessage
      });
      alert('Food claimed successfully! Delivery is now registered and assigned.');
      setShowClaimModal(false);
      setClaimMessage('');
      fetchAvailableFood();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to claim food');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && categories.length === 0) return <div style={{ color: 'var(--text-secondary)' }}>Loading Food Board...</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', color: '#fff' }}>Browse Available Food</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Claim approved surplus food packages and request delivery dispatch</p>
      </div>

      {/* Search and Filters Bar */}
      <div className="glass-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
        
        {/* Search */}
        <div style={{ position: 'relative', flex: 2, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="form-input" 
            style={{ paddingLeft: '45px' }}
            placeholder="Search by food name, description..." 
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <div style={{ flex: 1, minWidth: '150px' }}>
          <select 
            className="form-input"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Food Type Filter */}
        <div style={{ flex: 1, minWidth: '150px' }}>
          <select 
            className="form-input"
            value={foodType}
            onChange={(e) => setFoodType(e.target.value)}
          >
            <option value="">All Food Types</option>
            <option value="Veg">Vegetarian</option>
            <option value="Non Veg">Non-Vegetarian</option>
          </select>
        </div>

      </div>

      {/* Cards Board Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
        {donations.length === 0 ? (
          <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            No available food listings match your search options.
          </div>
        ) : (
          donations.map((d) => (
            <div key={d.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Photo placeholder if not uploaded */}
              <img 
                src={d.images && d.images.length > 0 ? d.images[0] : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500"} 
                alt={d.foodName}
                style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
              />

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ fontSize: '18px', color: '#fff' }}>{d.foodName}</h3>
                  <span className="badge badge-active">{d.foodType}</span>
                </div>

                <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <span><strong>Meals:</strong> {d.mealsCount} meals</span>
                  <span>|</span>
                  <span><strong>Quantity:</strong> {d.quantity}</span>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4', minHeight: '38px', margin: '4px 0' }}>
                  {d.description || 'No detailed description provided by donor.'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.01)', padding: '10px', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={12} />
                    <span><strong>Cooked:</strong> {new Date(d.cookingDate).toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={12} style={{ color: 'var(--danger)' }} />
                    <span><strong>Expires:</strong> {new Date(d.expiryTime).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={12} style={{ color: 'var(--primary)' }} />
                    <span><strong>Location:</strong> {d.pickupAddress}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => { setSelectedDonation(d); setShowClaimModal(true); }}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '10px' }}
              >
                Claim Food Package
              </button>
            </div>
          ))
        )}
      </div>

      {/* CLAIM / REQUEST MODAL */}
      {showClaimModal && selectedDonation && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120
        }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '480px', padding: '30px', position: 'relative' }}>
            <button 
              onClick={() => setShowClaimModal(false)}
              style={{ position: 'absolute', right: '20px', top: '20px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <h3 style={{ marginBottom: '14px', color: '#fff' }}>Claim Food Allocation</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              You are requesting <strong>{selectedDonation.foodName}</strong> ({selectedDonation.mealsCount} meals).
            </p>
            
            <form onSubmit={handleClaim}>
              <div className="form-group">
                <label className="form-label">Delivery Note / Message</label>
                <textarea 
                  className="form-input" 
                  rows="4"
                  placeholder="e.g. Please deliver this to our community shelter located at 12/B block. Our distribution starts at 8:00 PM."
                  value={claimMessage}
                  onChange={(e) => setClaimMessage(e.target.value)}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '10px' }}
                disabled={submitting}
              >
                {submitting ? 'Submitting claim...' : 'Confirm Allocation Claim'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default BrowseAvailableFood;
