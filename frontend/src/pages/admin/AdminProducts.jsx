import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products/admin/all');
      if (res.data && res.data.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error('Failed to load products:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete or deactivate "${name}"?`)) {
      return;
    }

    try {
      const res = await api.delete(`/products/${id}`);
      alert(res.data?.message || 'Product removed');
      fetchProducts();
    } catch (err) {
      alert(err.message || 'Failed to remove product');
    }
  };

  const getImageSrc = (imgPath) => {
    if (!imgPath) return '/images/hero-banner.jpg';
    if (imgPath.startsWith('http')) return imgPath;
    if (imgPath.startsWith('/uploads')) return import.meta.env.PROD ? imgPath : `http://localhost:5000${imgPath}`;
    return imgPath;
  };

  return (
    <AdminLayout title="Product Management">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <p style={{ color: 'var(--muted-text)' }}>
          Manage catalog formulas, update prices, adjust stock levels, or register new skincare items.
        </p>
        <Link to="/admin/products/new" className="btn-primary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}>
          <Plus size={16} /> Add New Product
        </Link>
      </div>

      <div className="table-card">
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted-text)' }}>
            Loading product database...
          </div>
        ) : (
          <div className="table-wrap">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Featured</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted-text)' }}>
                      No products found. Click "Add New Product" to create one.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <img
                            src={getImageSrc(p.image)}
                            alt={p.name}
                            style={{
                              width: '48px',
                              height: '48px',
                              objectFit: 'contain',
                              backgroundColor: '#fafbfc',
                              padding: '0.25rem',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border-color)',
                            }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/images/hero-banner.jpg';
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>{p.name}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--muted-text)' }}>
                              ID: {p._id.slice(-6).toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            padding: '0.2rem 0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--light-grey)',
                            color: 'var(--primary-navy)',
                          }}
                        >
                          {p.category}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700 }}>${Number(p.price).toFixed(2)}</td>
                      <td>
                        <span style={{ fontWeight: 600, color: p.stock <= 5 ? 'var(--danger)' : 'var(--dark-text)' }}>
                          {p.stock} units
                        </span>
                      </td>
                      <td>
                        {p.isFeatured ? (
                          <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.8rem' }}>Yes</span>
                        ) : (
                          <span style={{ color: 'var(--muted-text)', fontSize: '0.8rem' }}>No</span>
                        )}
                      </td>
                      <td>
                        {p.isActive ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              color: 'var(--success)',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                            }}
                          >
                            <CheckCircle2 size={14} /> Active
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              color: 'var(--danger)',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                            }}
                          >
                            <XCircle size={14} /> Inactive
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Link
                            to={`/admin/products/${p._id}/edit`}
                            style={{
                              padding: '0.4rem 0.75rem',
                              backgroundColor: 'var(--light-blue)',
                              color: 'var(--primary-navy)',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            <Edit size={13} /> Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(p._id, p.name)}
                            style={{
                              padding: '0.4rem 0.75rem',
                              backgroundColor: 'var(--danger-bg)',
                              color: 'var(--danger)',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
