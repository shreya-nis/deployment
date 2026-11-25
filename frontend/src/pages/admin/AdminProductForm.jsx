import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, Upload } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Cleansers',
    stock: '25',
    image: '',
    isFeatured: false,
    isActive: true,
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');

  const categories = [
    'Cleansers',
    'Moisturizers',
    'Serums',
    'Sunscreens',
    'Eye Care',
    'Body Care',
  ];

  useEffect(() => {
    if (isEdit) {
      const fetchProduct = async () => {
        try {
          const res = await api.get(`/products/${id}`);
          if (res.data && res.data.success) {
            const p = res.data.product;
            setFormData({
              name: p.name,
              description: p.description,
              price: String(p.price),
              category: p.category,
              stock: String(p.stock),
              image: p.image,
              isFeatured: p.isFeatured,
              isActive: p.isActive,
            });
          }
        } catch (err) {
          setError(err.message || 'Failed to load product for editing');
        } finally {
          setFetching(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.description || formData.price === '') {
      setError('Name, description, and price are required');
      return;
    }

    try {
      setLoading(true);

      // Use FormData to support Multer upload
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('category', formData.category);
      data.append('stock', formData.stock);
      data.append('isFeatured', formData.isFeatured);
      data.append('isActive', formData.isActive);

      if (file) {
        data.append('image', file);
      } else if (formData.image) {
        data.append('image', formData.image);
      } else {
        setError('Please provide an image URL or upload an image file');
        setLoading(false);
        return;
      }

      const headers = { 'Content-Type': 'multipart/form-data' };

      if (isEdit) {
        await api.put(`/products/${id}`, data, { headers });
      } else {
        await api.post('/products', data, { headers });
      }

      navigate('/admin/products');
    } catch (err) {
      setError(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <AdminLayout title="Edit Product">
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted-text)' }}>
          Loading product information...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isEdit ? 'Edit Product' : 'Add New Product'}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/admin/products"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--secondary-blue)',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={16} /> Back to Products
        </Link>
      </div>

      <div className="table-card" style={{ maxWidth: '800px', padding: '2.5rem' }}>
        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input
              type="text"
              name="name"
              required
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Hydrating Facial Cleanser"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleChange}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Price ($ USD) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="price"
                required
                className="form-input"
                value={formData.price}
                onChange={handleChange}
                placeholder="15.99"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Warehouse Stock Quantity *</label>
              <input
                type="number"
                min="0"
                name="stock"
                required
                className="form-input"
                value={formData.stock}
                onChange={handleChange}
                placeholder="50"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Image Path / URL</label>
              <input
                type="text"
                name="image"
                className="form-input"
                value={formData.image}
                onChange={handleChange}
                placeholder="/uploads/hydrating-cleanser.jpg"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Upload New Image File (Multer Supported)</label>
            <input
              type="file"
              accept="image/*"
              className="form-input"
              onChange={handleFileChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Product Description *</label>
            <textarea
              name="description"
              required
              className="form-textarea"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Clinical description, ceramides formula, benefits..."
            />
          </div>

          <div style={{ display: 'flex', gap: '2rem', margin: '1.5rem 0' }}>
            <label className="form-checkbox">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
              />
              <span>Featured on Homepage</span>
            </label>

            <label className="form-checkbox">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
              <span>Active in Public Store</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}
          >
            <Save size={18} />
            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Product'}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminProductForm;
