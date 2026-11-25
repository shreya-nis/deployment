import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Checkout = () => {
  const { user } = useAuth();
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customerName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    deliveryAddress: user?.address || '',
    note: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.customerName || !formData.email || !formData.phone || !formData.deliveryAddress) {
      setError('Please provide all required delivery details (Name, Email, Phone, Address)');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/orders', {
        customerName: formData.customerName,
        email: formData.email,
        phone: formData.phone,
        deliveryAddress: formData.deliveryAddress,
        note: formData.note,
      });

      if (res.data && res.data.success) {
        await refreshCart();
        navigate(`/account/orders/${res.data.order._id}?placed=true`);
      }
    } catch (err) {
      setError(err.message || 'Failed to place order. Please check stock and cart items.');
    } finally {
      setLoading(false);
    }
  };

  const items = cart.items || [];
  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--primary-navy)' }}>Your cart is empty</h2>
        <p style={{ color: 'var(--muted-text)', margin: '1rem 0 2rem' }}>
          Please add items to your cart before proceeding to checkout.
        </p>
        <Link to="/shop" className="btn-primary">
          <ArrowLeft size={16} /> Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--light-grey)', minHeight: '80vh', padding: '3rem 0 5rem' }}>
      <div className="container">
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/cart"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--secondary-blue)',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={16} /> Back to Cart
          </Link>
          <h1 className="section-title" style={{ marginTop: '0.5rem' }}>
            Checkout & Delivery
          </h1>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ maxWidth: '1000px', margin: '0 auto 1.5rem' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2rem', alignItems: 'flex-start' }}>
            {/* Delivery Form */}
            <div
              style={{
                backgroundColor: 'var(--white)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '2rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h3 style={{ color: 'var(--primary-navy)', fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>
                Delivery Information
              </h3>

              <div className="form-group">
                <label className="form-label">Recipient Full Name *</label>
                <input
                  type="text"
                  name="customerName"
                  required
                  className="form-input"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="e.g. Emma Watson"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="form-input"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    className="form-input"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Full Delivery Address *</label>
                <textarea
                  name="deliveryAddress"
                  required
                  className="form-textarea"
                  value={formData.deliveryAddress}
                  onChange={handleChange}
                  placeholder="Street address, Apartment/Suite, City, State, Postal Code"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Delivery Instructions / Order Note (Optional)</label>
                <input
                  type="text"
                  name="note"
                  className="form-input"
                  value={formData.note}
                  onChange={handleChange}
                  placeholder="e.g. Leave package with front desk or ring bell"
                />
              </div>

              {/* Payment Method Notice */}
              <div
                style={{
                  marginTop: '1.5rem',
                  padding: '1.25rem',
                  backgroundColor: 'var(--light-blue)',
                  border: '1px solid #bae6fd',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                  <Truck size={22} color="var(--primary-navy)" />
                  <strong style={{ color: 'var(--primary-navy)', fontSize: '1rem' }}>
                    Payment Method: Cash on Delivery (COD)
                  </strong>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--dark-text)', lineHeight: 1.5 }}>
                  You will pay the exact total in cash directly to the delivery courier when your order arrives. Please have the exact change ready.
                </p>
              </div>
            </div>

            {/* Order Review & Place Order */}
            <div
              style={{
                backgroundColor: 'var(--white)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '2rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h3 style={{ color: 'var(--primary-navy)', fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>
                Review Order ({cart.totalItems} items)
              </h3>

              <div style={{ maxHeight: '260px', overflowY: 'auto', marginBottom: '1.25rem', paddingRight: '0.5rem' }}>
                {items.map((item, idx) => {
                  const p = item.product || {};
                  return (
                    <div
                      key={p._id || idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.6rem 0',
                        borderBottom: '1px solid #f0f0f0',
                        fontSize: '0.9rem',
                      }}
                    >
                      <div style={{ maxWidth: '65%' }}>
                        <div style={{ fontWeight: 600, color: 'var(--primary-navy)' }}>{p.name}</div>
                        <div style={{ color: 'var(--muted-text)', fontSize: '0.8rem' }}>
                          Qty: {item.quantity} × ${Number(p.price).toFixed(2)}
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--dark-text)' }}>
                        ${(p.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--muted-text)' }}>Subtotal:</span>
                  <span style={{ fontWeight: 700 }}>${Number(cart.subtotal).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--muted-text)' }}>Delivery:</span>
                  <span style={{ color: 'var(--success)', fontWeight: 700 }}>FREE (COD)</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    paddingTop: '0.75rem',
                    borderTop: '2px dashed var(--border-color)',
                    marginTop: '0.5rem',
                  }}
                >
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                    Total to Pay on Delivery:
                  </span>
                  <span style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                    ${Number(cart.total).toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', marginTop: '1.5rem', padding: '0.95rem', fontSize: '1.05rem' }}
              >
                {loading ? 'Processing Order...' : 'Confirm & Place COD Order'}
              </button>

              <div
                style={{
                  marginTop: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  color: 'var(--muted-text)',
                  fontSize: '0.82rem',
                }}
              >
                <ShieldCheck size={16} color="var(--success)" />
                <span>Zero upfront charge • Pay when your order arrives</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
