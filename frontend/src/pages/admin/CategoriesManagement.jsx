import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FolderPlus, Edit2, Trash2, X } from 'lucide-react';

const CategoriesManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const fetchCategories = async () => {
    try {
      const response = await api.get('/Categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/Categories', { name, description });
      alert('Category added successfully!');
      setShowAddModal(false);
      setName('');
      setDescription('');
      fetchCategories();
    } catch (error) {
      alert('Failed to add category');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/Categories/${selectedCategory.id}`, { name, description });
      alert('Category updated successfully!');
      setShowEditModal(false);
      setName('');
      setDescription('');
      setSelectedCategory(null);
      fetchCategories();
    } catch (error) {
      alert('Failed to update category');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.delete(`/Categories/${id}`);
      fetchCategories();
    } catch (error) {
      alert('Failed to delete category');
    }
  };

  const openEdit = (cat) => {
    setSelectedCategory(cat);
    setName(cat.name);
    setDescription(cat.description);
    setShowEditModal(true);
  };

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading Categories...</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: '#fff' }}>Food Categories</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Manage food item categories and taxonomy settings</p>
        </div>
        <button 
          onClick={() => { setName(''); setDescription(''); setShowAddModal(true); }}
          className="btn btn-primary"
        >
          <FolderPlus size={18} />
          Add Category
        </button>
      </div>

      {/* Grid List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {categories.map((cat) => (
          <div key={cat.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '18px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {cat.name}
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>ID: {cat.id}</span>
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.5', minHeight: '40px' }}>
                {cat.description || 'No description provided.'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', borderTop: '1px solid var(--glass-border)', paddingTop: '12px' }}>
              <button 
                onClick={() => openEdit(cat)}
                className="btn btn-secondary" 
                style={{ padding: '8px 12px', fontSize: '12px', flex: 1 }}
              >
                <Edit2 size={12} />
                Edit
              </button>
              <button 
                onClick={() => handleDelete(cat.id)}
                className="btn btn-secondary" 
                style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--danger)' }}
              >
                <Trash2 size={12} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ADD CATEGORY MODAL */}
      {showAddModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '30px', position: 'relative' }}>
            <button 
              onClick={() => setShowAddModal(false)}
              style={{ position: 'absolute', right: '20px', top: '20px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <h3 style={{ marginBottom: '20px', color: '#fff' }}>Add Food Category</h3>
            
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label className="form-label">Category Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g., Seafood"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-input" 
                  rows="3"
                  placeholder="Details about food safety and item categories"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                Save Category
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CATEGORY MODAL */}
      {showEditModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '30px', position: 'relative' }}>
            <button 
              onClick={() => setShowEditModal(false)}
              style={{ position: 'absolute', right: '20px', top: '20px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <h3 style={{ marginBottom: '20px', color: '#fff' }}>Edit Category</h3>
            
            <form onSubmit={handleEdit}>
              <div className="form-group">
                <label className="form-label">Category Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-input" 
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                Update Category
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CategoriesManagement;
