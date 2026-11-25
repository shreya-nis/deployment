import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Package, Truck, CheckCheck, XCircle, AlertCircle, Save } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';

const AdminOrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/${id}`);
      if (res.data && res.data.success) {
        setOrder(res.data.order);
        setSelectedStatus(res.data.order.status);
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const ALLOWED_TRANSITIONS = {
    Pending: ['Confirmed', 'Cancelled'],
    Confirmed: ['Packed', 'Cancelled'],
    Packed: ['Shipped', 'Cancelled'],
    Shipped: ['Delivered'],
    Delivered: [],
    Cancelled: [],
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (selectedStatus === order.status) {
      setError('Please select a new target status');
      return;
    }

    try {
      setUpdating(true);
      const res = await api.patch(`/orders/${id}/status`, {
        status: selectedStatus,
        note: statusNote || `Status updated to ${selectedStatus} by admin`,
      });

      if (res.data && res.data.success) {
        setSuccess(`Order status successfully updated to "${selectedStatus}"`);
        setStatusNote('');
        fetchOrder();
      }
    } catch (err) {
      setError(err.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const getImageSrc = (imgPath) => {
    if (!imgPath) return '/images/hero-banner.jpg';
    if (imgPath.startsWith('http')) return imgPath;
    if (imgPath.startsWith('/uploads')) return import.meta.env.PROD ? imgPath : `http://localhost:5000${imgPath}`;
    return imgPath;
  };

  if (loading) {
    return (
      <AdminLayout title="Order Details">
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted-text)' }}>
          Loading order details...
        </div>
      </AdminLayout>
    );
  }

  if (error && !order) {
    return (
      <AdminLayout title="Order Details">
        <div className="alert alert-danger">{error}</div>
      </AdminLayout>
    );
  }

  const nextOptions = ALLOWED_TRANSITIONS[order.status] || [];

  return (
    <AdminLayout title={`Order #${order._id.slice(-6).toUpperCase()}`}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/admin/orders"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--secondary-blue)',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={16} /> Back to Order List
        </Link>
      </div>

      {success && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Left Column: Order Items & Customer Details */}
        <div>
          <div className="table-card" style={{ marginBottom: '2rem' }}>
            <div className="table-header">
              <h2 className="table-title">Ordered Products ({order.items.length})</h2>
              <span className={`status-badge status-${order.status}`}>{order.status}</span>
            </div>

            <div style={{ padding: '0 1.5rem' }}>
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.25rem',
                    padding: '1.25rem 0',
                    borderBottom: idx !== order.items.length - 1 ? '1px solid var(--border-color)' : 'none',
                  }}
                >
                  <img
                    src={getImageSrc(item.image)}
                    alt={item.productName}
                    style={{
                      width: '60px',
                      height: '60px',
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
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>{item.productName}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted-text)' }}>
                      ${Number(item.price).toFixed(2)} × {item.quantity} units
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, color: 'var(--primary-navy)', fontSize: '1.1rem' }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                backgroundColor: 'var(--light-grey)',
                padding: '1.25rem 1.5rem',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
              <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--primary-navy)' }}>
                Total (Cash on Delivery):
              </span>
              <span style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--primary-navy)' }}>
                ${Number(order.total).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Customer Destination Card */}
          <div className="table-card">
            <div className="table-header">
              <h2 className="table-title">Customer & Destination Info</h2>
            </div>
            <div style={{ padding: '1.5rem', fontSize: '0.92rem', lineHeight: 1.7 }}>
              <div>
                <strong>Customer Name:</strong> {order.customerName}
              </div>
              <div>
                <strong>Email Address:</strong> {order.email}
              </div>
              <div>
                <strong>Contact Phone:</strong> {order.phone}
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                <strong>Delivery Address:</strong>
                <div style={{ color: 'var(--muted-text)' }}>{order.deliveryAddress}</div>
              </div>
              {order.note && (
                <div style={{ marginTop: '0.5rem' }}>
                  <strong>Order Note:</strong> <em>{order.note}</em>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Status Transition Panel & Timeline */}
        <div>
          {/* Status Fulfilment Updater */}
          <div className="table-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '1rem' }}>
              Fulfilment Control
            </h3>

            <div style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
              Current Status:{' '}
              <span className={`status-badge status-${order.status}`}>{order.status}</span>
            </div>

            {nextOptions.length === 0 ? (
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--light-grey)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  color: 'var(--muted-text)',
                }}
              >
                Order has reached terminal status (<strong>{order.status}</strong>). No further forward transitions allowed.
              </div>
            ) : (
              <form onSubmit={handleStatusUpdate}>
                <div className="form-group">
                  <label className="form-label">Next Permitted Status:</label>
                  <select
                    className="form-select"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value={order.status}>Current: {order.status}</option>
                    {nextOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        Move to: {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Admin Update Note (Optional):</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Courier tracking assigned or packed in box"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={updating || selectedStatus === order.status}
                  className="btn-primary"
                  style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem' }}
                >
                  <Save size={16} />
                  {updating ? 'Updating...' : `Update to "${selectedStatus}"`}
                </button>
              </form>
            )}

            {order.stockRestored && (
              <div
                style={{
                  marginTop: '1rem',
                  fontSize: '0.8rem',
                  color: 'var(--success)',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <CheckCircle size={14} /> Stock was restored back to warehouse.
              </div>
            )}
          </div>

          {/* Audit Timeline */}
          <div className="table-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '1rem' }}>
              Status History Timeline
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {order.statusHistory && order.statusHistory.length > 0 ? (
                order.statusHistory.map((h, i) => (
                  <div key={i} style={{ borderLeft: '2px solid var(--secondary-blue)', paddingLeft: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--muted-text)' }}>
                      <strong style={{ color: 'var(--primary-navy)' }}>{h.status}</strong>
                      <span>{new Date(h.updatedAt).toLocaleString()}</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--dark-text)', marginTop: '2px' }}>
                      By: <em>{h.updatedBy}</em> — {h.note}
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--muted-text)', fontSize: '0.85rem' }}>No history entries.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrderDetails;
