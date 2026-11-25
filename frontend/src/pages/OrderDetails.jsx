import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, Package, Truck, CheckCheck, XCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';

const OrderDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const isJustPlaced = new URLSearchParams(location.search).get('placed') === 'true';

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/${id}`);
      if (res.data && res.data.success) {
        setOrder(res.data.order);
      }
    } catch (err) {
      setError(err.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this pending order?')) {
      return;
    }

    try {
      setCancelling(true);
      const res = await api.patch(`/orders/${id}/cancel`, {
        reason: 'Customer requested cancellation via portal',
      });
      if (res.data && res.data.success) {
        alert('Order has been successfully cancelled and stock restored.');
        fetchOrder();
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
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
      <div style={{ padding: '6rem 0', textAlign: 'center', color: 'var(--muted-text)' }}>
        Loading order details...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--primary-navy)' }}>Order Not Found</h2>
        <p style={{ color: 'var(--muted-text)', margin: '1rem 0 2rem' }}>
          {error || 'Unable to retrieve this order.'}
        </p>
        <Link to="/account/orders" className="btn-primary">
          <ArrowLeft size={16} /> Return to Orders
        </Link>
      </div>
    );
  }

  const steps = [
    { key: 'Pending', label: 'Order Placed', icon: Clock },
    { key: 'Confirmed', label: 'Accepted', icon: CheckCircle },
    { key: 'Packed', label: 'Packed', icon: Package },
    { key: 'Shipped', label: 'Dispatched', icon: Truck },
    { key: 'Delivered', label: 'Delivered', icon: CheckCheck },
  ];

  const currentStepIdx = steps.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === 'Cancelled';

  return (
    <div style={{ backgroundColor: 'var(--light-grey)', minHeight: '80vh', padding: '3rem 0 5rem' }}>
      <div className="container">
        {/* Back Link */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/account/orders"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--secondary-blue)',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={16} /> Back to My Orders
          </Link>
        </div>

        {/* Confirmation banner if just placed */}
        {isJustPlaced && (
          <div
            style={{
              backgroundColor: '#d1fae5',
              border: '1px solid #86efac',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem 1.5rem',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <CheckCircle size={28} color="#059669" />
            <div>
              <h3 style={{ color: '#065f46', fontSize: '1.1rem', fontWeight: 800 }}>
                Thank you! Your Cash on Delivery order has been placed.
              </h3>
              <p style={{ color: '#047857', fontSize: '0.9rem', marginTop: '2px' }}>
                Order #{order._id.slice(-6).toUpperCase()} is currently Pending approval by our team.
              </p>
            </div>
          </div>
        )}

        {/* Order Header Card */}
        <div
          style={{
            backgroundColor: 'var(--white)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '2rem',
              paddingBottom: '1.5rem',
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--muted-text)', textTransform: 'uppercase', fontWeight: 700 }}>
                Order Reference
              </span>
              <h1 style={{ color: 'var(--primary-navy)', fontSize: '1.75rem', fontWeight: 800 }}>
                #{order._id.slice(-6).toUpperCase()}
              </h1>
              <div style={{ color: 'var(--muted-text)', fontSize: '0.88rem', marginTop: '2px' }}>
                Placed on {new Date(order.createdAt).toLocaleString()}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className={`status-badge status-${order.status}`} style={{ fontSize: '0.95rem', padding: '0.4rem 1rem' }}>
                {order.status}
              </span>
              <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--muted-text)' }}>
                Payment: <strong style={{ color: 'var(--primary-navy)' }}>Cash on Delivery (COD)</strong>
              </div>
            </div>
          </div>

          {/* Stepper Flow */}
          {isCancelled ? (
            <div
              style={{
                backgroundColor: 'var(--danger-bg)',
                color: 'var(--danger)',
                border: '1px solid #fca5a5',
                borderRadius: 'var(--radius-sm)',
                padding: '1rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <XCircle size={24} />
              <div>
                <strong>Order Cancelled</strong>
                <p style={{ fontSize: '0.85rem', marginTop: '2px' }}>
                  This order was cancelled. Product quantities have been returned to warehouse stock.
                </p>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${steps.length}, 1fr)`,
                gap: '0.5rem',
                position: 'relative',
              }}
            >
              {steps.map((s, idx) => {
                const Icon = s.icon;
                const isPassed = currentStepIdx >= idx;
                const isCurrent = currentStepIdx === idx;
                return (
                  <div key={s.key} style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        backgroundColor: isPassed ? 'var(--primary-navy)' : 'var(--light-grey)',
                        color: isPassed ? '#fff' : 'var(--muted-text)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 0.5rem',
                        border: isCurrent ? '3px solid var(--secondary-blue)' : 'none',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <div
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: isPassed ? 700 : 500,
                        color: isPassed ? 'var(--primary-navy)' : 'var(--muted-text)',
                      }}
                    >
                      {s.label}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Order Details & Summary Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '2rem', alignItems: 'flex-start' }}>
          {/* Items Table */}
          <div
            style={{
              backgroundColor: 'var(--white)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                Ordered Products ({order.items.length})
              </h3>
            </div>

            <div>
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.25rem',
                    borderBottom: idx !== order.items.length - 1 ? '1px solid var(--border-color)' : 'none',
                  }}
                >
                  <img
                    src={getImageSrc(item.image)}
                    alt={item.productName}
                    style={{
                      width: '64px',
                      height: '64px',
                      objectFit: 'contain',
                      backgroundColor: '#fafbfc',
                      padding: '0.35rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/hero-banner.jpg';
                    }}
                  />
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontWeight: 700, color: 'var(--primary-navy)', fontSize: '0.98rem' }}>
                      {item.productName}
                    </div>
                    <div style={{ color: 'var(--muted-text)', fontSize: '0.85rem' }}>
                      ${Number(item.price).toFixed(2)} × {item.quantity}
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, color: 'var(--primary-navy)', fontSize: '1.05rem' }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Total Row */}
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
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary-navy)' }}>
                Total (Pay via COD):
              </span>
              <span style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--primary-navy)' }}>
                ${Number(order.total).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Delivery & Status Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div
              style={{
                backgroundColor: 'var(--white)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '1rem' }}>
                Delivery Destination
              </h3>

              <div style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--dark-text)' }}>
                <div>
                  <strong>Recipient:</strong> {order.customerName}
                </div>
                <div>
                  <strong>Phone:</strong> {order.phone}
                </div>
                <div>
                  <strong>Email:</strong> {order.email}
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  <strong>Address:</strong>
                  <div style={{ color: 'var(--muted-text)' }}>{order.deliveryAddress}</div>
                </div>
                {order.note && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <strong>Note:</strong> <em>{order.note}</em>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Cancellation Option */}
            {order.status === 'Pending' && (
              <div
                style={{
                  backgroundColor: 'var(--white)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.5rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <h4 style={{ color: 'var(--danger)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  Order Cancellation
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted-text)', marginBottom: '1rem' }}>
                  You may cancel this order while it is still in Pending status.
                </p>
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  style={{
                    backgroundColor: 'var(--danger-bg)',
                    color: 'var(--danger)',
                    border: '1px solid #fca5a5',
                    padding: '0.6rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    width: '100%',
                  }}
                >
                  {cancelling ? 'Cancelling...' : 'Cancel This Order'}
                </button>
              </div>
            )}

            {/* Status History Timeline */}
            <div
              style={{
                backgroundColor: 'var(--white)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '1rem' }}>
                Order Timeline
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {order.statusHistory && order.statusHistory.length > 0 ? (
                  order.statusHistory.map((h, i) => (
                    <div key={i} style={{ borderLeft: '2px solid var(--secondary-blue)', paddingLeft: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--muted-text)' }}>
                        <span style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>{h.status}</span>
                        <span>{new Date(h.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--dark-text)', marginTop: '2px' }}>
                        {h.note || 'Status updated'}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted-text)' }}>No recorded timeline events.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
