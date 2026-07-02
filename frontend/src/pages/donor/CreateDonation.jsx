import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Gift, Calendar, Clock, MapPin, Phone, HelpCircle } from 'lucide-react';

const CreateDonation = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  
  // Form fields
  const [foodName, setFoodName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [mealsCount, setMealsCount] = useState('');
  const [foodType, setFoodType] = useState('Veg');
  const [storageType, setStorageType] = useState('Ambient');
  const [description, setDescription] = useState('');
  const [cookingDate, setCookingDate] = useState(new Date().toISOString().substring(0, 10));
  
  // Calculate default expiry (e.g. 12 hours from now)
  const defaultExpiry = new Date(Date.now() + 12 * 60 * 60 * 1000);
  const [expiryTime, setExpiryTime] = useState(defaultExpiry.toISOString().substring(0, 16));
  
  const [pickupTime, setPickupTime] = useState(new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().substring(0, 16));
  const [pickupAddress, setPickupAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/Categories');
      setCategories(response.data);
      if (response.data.length > 0) {
        setCategoryId(response.data[0].id);
      }
    } catch (error) {
      console.error('Failed to load categories', error);
    }
  };

  // Pre-populate address from user profile if possible
  const prefillProfileAddress = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userObj = JSON.parse(userStr);
      if (userObj.profile) {
        const prof = userObj.profile;
        setPickupAddress(`${prof.area || ''}, ${prof.city || ''}, ${prof.pincode || ''}`.trim());
      }
    }
  };

  useEffect(() => {
    fetchCategories();
    prefillProfileAddress();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      foodName,
      categoryId: Number(categoryId),
      quantity,
      mealsCount: Number(mealsCount),
      foodType,
      storageType,
      description,
      cookingDate: new Date(cookingDate).toISOString(),
      expiryTime: new Date(expiryTime).toISOString(),
      pickupTime: new Date(pickupTime).toISOString(),
      pickupAddress,
      contactNumber,
      images: imageUrl ? [imageUrl] : []
    };

    try {
      await api.post('/FoodDonations', payload);
      alert('Food donation submitted successfully! Waiting for Admin approval.');
      navigate('/donor');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit food donation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', color: '#fff' }}>Donate Surplus Food</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Publish details of available food so local NGOs can claim and distribute it</p>
      </div>

      {/* Form Container */}
      <div className="glass-card">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Section 1: Food Details */}
          <h3 style={{ fontSize: '16px', color: 'var(--primary)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>
            1. Food Listing Information
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Food Item Name</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g., Vegetable Biryani, Bread Loaves"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Category</label>
              <select 
                className="form-input"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Quantity</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g., 5 kg, 12 packs"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Meals Count</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="e.g., 30"
                value={mealsCount}
                onChange={(e) => setMealsCount(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Food Type</label>
              <select 
                className="form-input" 
                value={foodType} 
                onChange={(e) => setFoodType(e.target.value)}
              >
                <option value="Veg">Vegetarian</option>
                <option value="Non Veg">Non-Vegetarian</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Storage Type</label>
              <select 
                className="form-input" 
                value={storageType} 
                onChange={(e) => setStorageType(e.target.value)}
              >
                <option value="Ambient">Ambient / Room Temp</option>
                <option value="Dry">Dry Storage</option>
                <option value="Refrigerated">Refrigerated</option>
                <option value="Frozen">Frozen</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Description / Ingredients (Optional)</label>
            <textarea 
              className="form-input" 
              rows="3" 
              placeholder="e.g., Contain dairy products. Cooked in hygienic conditions. Best consumed warm."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Section 2: Expiry & Prep */}
          <h3 style={{ fontSize: '16px', color: 'var(--primary)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px', marginTop: '10px' }}>
            2. Shelf Life and Timeline
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Cooking / Preparation Date</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={16} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
                <input 
                  type="date" 
                  className="form-input" 
                  style={{ paddingLeft: '45px' }}
                  value={cookingDate}
                  onChange={(e) => setCookingDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Expiry Time / Date</label>
              <div style={{ position: 'relative' }}>
                <Clock size={16} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
                <input 
                  type="datetime-local" 
                  className="form-input" 
                  style={{ paddingLeft: '45px' }}
                  value={expiryTime}
                  onChange={(e) => setExpiryTime(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Logistics */}
          <h3 style={{ fontSize: '16px', color: 'var(--primary)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px', marginTop: '10px' }}>
            3. Pickup Logistics & Contact
          </h3>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Pickup Street Address</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={16} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="form-input" 
                style={{ paddingLeft: '45px' }}
                placeholder="Where should the volunteer pick it up?" 
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Preferred Pickup Time</label>
              <div style={{ position: 'relative' }}>
                <Clock size={16} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
                <input 
                  type="datetime-local" 
                  className="form-input" 
                  style={{ paddingLeft: '45px' }}
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Contact Mobile Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
                <input 
                  type="tel" 
                  className="form-input" 
                  style={{ paddingLeft: '45px' }}
                  placeholder="Contact details for deliverer" 
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '10px' }}>
            <label className="form-label">Food Image URL (Optional)</label>
            <input 
              type="url" 
              className="form-input" 
              placeholder="e.g. https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ padding: '14px', width: '100%', fontSize: '16px', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? 'Submitting food listing...' : 'Submit Donation'}
          </button>

        </form>
      </div>

    </div>
  );
};

export default CreateDonation;
