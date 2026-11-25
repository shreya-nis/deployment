import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, User as UserIcon, MapPin, Phone, ArrowRight, Clock } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const UserDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/my-orders');
        if (res.data && res.data.success) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        console.error('Failed to load customer orders:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div style={{ backgroundColor: 'var(--light-grey)', minHeight: '80vh', padding: '3rem 0 5rem' }}>
      <div className="container">
        {/* Welcome Header */}
        <div style={{ marginBottom: '2rem' }}>
          <span className="section-tag">Customer Account</span>
          <h1 className="section-title">Welcome back, {user?.name}!</h1>
          <p style={{ color: 'var(--muted-text)', marginTop: '0.25rem' }}>
            Manage your profile, view recent Cash on Delivery orders, and check shipment statuses.
          </p>
        </div>

        {/* Overview Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div
            style={{
              backgroundColor: 'var(--white)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: 'var(--light-blue)',
                color: 'var(--secondary-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShoppingBag size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted-text)', fontWeight: 600, textTransform: 'uppercase' }}>
                Total Orders Placed
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                {orders.length}
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'var(--white)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: '#d1fae5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UserIcon size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted-text)', fontWeight: 600, textTransform: 'uppercase' }}>
                Account Status
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                Active & Verified
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'var(--white)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: '#fef3c7',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MapPin size={24} />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted-text)', fontWeight: 600, textTransform: 'uppercase' }}>
                Saved Delivery Location
              </div>
              <div
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: 'var(--dark-text)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginTop: '4px',
                }}
              >
                {user?.address || 'No address saved yet'}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="table-card">
          <div className="table-header">
            <h2 className="table-title">Recent Orders</h2>
            <Link to="/account/orders" style={{ color: 'var(--secondary-blue)', fontWeight: 600, fontSize: '0.9rem' }}>
              View All Orders ({orders.length}) <ArrowRight size={14} style={{ verticalAlign: 'middle' }} />
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-text)' }}>
              Loading your orders...
            </div>
          ) : orders.length === 0 ? (
            <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--muted-text)', marginBottom: '1.5rem' }}>
                You have not placed any orders yet.
              </p>
              <Link to="/shop" className="btn-primary">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order._id}>
                      <td style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>
                        #{order._id.slice(-6).toUpperCase()}
                      </td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</td>
                      <td style={{ fontWeight: 700 }}>${Number(order.total).toFixed(2)}</td>
                      <td>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-navy)' }}>
                          COD
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge status-${order.status}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <Link
                          to={`/account/orders/${order._id}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            color: 'var(--secondary-blue)',
                            fontWeight: 600,
                            fontSize: '0.88rem',
                          }}
                        >
                          View Details <ArrowRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Links Group */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <Link to="/account/profile" className="btn-outline">
            Update Profile & Address
          </Link>
          <Link to="/shop" className="btn-primary">
            Explore Storefront
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
