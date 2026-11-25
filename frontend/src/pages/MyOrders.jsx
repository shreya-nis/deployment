import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ShoppingBag } from 'lucide-react';
import api from '../services/api';

const MyOrders = () => {
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
        console.error('Failed to load orders:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

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
            My Orders ({orders.length})
          </h1>
        </div>

        <div className="table-card">
          {loading ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted-text)' }}>
              Loading your order history...
            </div>
          ) : orders.length === 0 ? (
            <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--light-blue)',
                  color: 'var(--secondary-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}
              >
                <ShoppingBag size={28} />
              </div>
              <h3 style={{ color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>No orders placed yet</h3>
              <p style={{ color: 'var(--muted-text)', marginBottom: '1.5rem' }}>
                When you order skincare with Cash on Delivery, your order status will be tracked here.
              </p>
              <Link to="/shop" className="btn-primary">
                Shop Products
              </Link>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Placed On</th>
                    <th>Items Summary</th>
                    <th>Total Amount</th>
                    <th>Payment</th>
                    <th>Current Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>
                        #{order._id.slice(-6).toUpperCase()}
                      </td>
                      <td>
                        {new Date(order.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>
                          {order.items.map((i) => i.productName).join(', ')}
                        </span>
                      </td>
                      <td style={{ fontWeight: 800, color: 'var(--primary-navy)' }}>
                        ${Number(order.total).toFixed(2)}
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            backgroundColor: 'var(--light-blue)',
                            color: 'var(--primary-navy)',
                            padding: '0.2rem 0.5rem',
                            borderRadius: 'var(--radius-sm)',
                          }}
                        >
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
                          }}
                        >
                          Details <ArrowRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
