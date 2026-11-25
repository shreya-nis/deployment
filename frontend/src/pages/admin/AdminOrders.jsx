import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Filter, ArrowRight, Eye } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const statuses = [
    'All',
    'Pending',
    'Confirmed',
    'Packed',
    'Shipped',
    'Delivered',
    'Cancelled',
  ];

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url = statusFilter === 'All' ? '/orders' : `/orders?status=${statusFilter}`;
      const res = await api.get(url);
      if (res.data && res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Failed to load orders:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  return (
    <AdminLayout title="Order Management & Fulfilment">
      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted-text)', marginRight: '0.5rem' }}>
          Filter Status:
        </span>
        {statuses.map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: 600,
              backgroundColor: statusFilter === st ? 'var(--primary-navy)' : 'var(--white)',
              color: statusFilter === st ? '#fff' : 'var(--dark-text)',
              border: '1px solid ' + (statusFilter === st ? 'var(--primary-navy)' : 'var(--border-color)'),
              transition: 'all 0.2s',
            }}
          >
            {st}
          </button>
        ))}
      </div>

      <div className="table-card">
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted-text)' }}>
            Loading customer orders...
          </div>
        ) : orders.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted-text)' }}>
            No orders found with status "{statusFilter}".
          </div>
        ) : (
          <div className="table-wrap">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Order Reference</th>
                  <th>Customer</th>
                  <th>Placed Date</th>
                  <th>Items Summary</th>
                  <th>Total Amount</th>
                  <th>Payment</th>
                  <th>Current Status</th>
                  <th>Fulfilment Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((ord) => (
                  <tr key={ord._id}>
                    <td style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>
                      #{ord._id.slice(-6).toUpperCase()}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{ord.customerName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted-text)' }}>{ord.phone}</div>
                    </td>
                    <td>{new Date(ord.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span style={{ fontSize: '0.88rem' }}>
                        {ord.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                      </span>
                    </td>
                    <td style={{ fontWeight: 800, color: 'var(--primary-navy)' }}>
                      ${Number(ord.total).toFixed(2)}
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
                      <span className={`status-badge status-${ord.status}`}>
                        {ord.status}
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`/admin/orders/${ord._id}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          backgroundColor: 'var(--secondary-blue)',
                          color: '#fff',
                          padding: '0.4rem 0.85rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                        }}
                      >
                        <Eye size={14} /> Review & Update
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
