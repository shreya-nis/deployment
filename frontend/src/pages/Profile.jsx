import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, User, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    try {
      setLoading(true);
      await updateProfile(formData);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--light-grey)', minHeight: '80vh', padding: '3rem 0 5rem' }}>
      <div className="container">
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/account"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--secondary-blue)',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <h1 className="section-title" style={{ marginTop: '0.5rem' }}>
            Customer Profile
          </h1>
        </div>

        <div className="form-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          {success && (
            <div className="alert alert-success">
              <Check size={18} />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="alert alert-danger">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                required
                className="form-input"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Registered)</label>
              <input
                type="email"
                disabled
                className="form-input"
                style={{ backgroundColor: 'var(--light-grey)', color: 'var(--muted-text)', cursor: 'not-allowed' }}
                value={user?.email || ''}
              />
              <span style={{ fontSize: '0.78rem', color: 'var(--muted-text)', marginTop: '2px', display: 'block' }}>
                Account email cannot be modified.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone Number (For COD Courier Delivery)</label>
              <input
                type="tel"
                name="phone"
                className="form-input"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Default Delivery Address</label>
              <textarea
                name="address"
                className="form-textarea"
                value={formData.address}
                onChange={handleChange}
                placeholder="Street address, City, State, ZIP code"
                rows={3}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', marginTop: '1rem' }}
            >
              {loading ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
