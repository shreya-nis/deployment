import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Users, ShoppingBag, DollarSign, ArrowRight, Clock, Activity } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/dashboard');
        if (res.data && res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <AdminLayout title="Overview & Statistics">
      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted-text)' }}>
          Loading dashboard metrics...
        </div>
      ) : (
        <div>
          {/* Summary Metric Cards */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div>
                <div className="metric-title">Active Products</div>
                <div className="metric-value">{data?.stats?.totalProducts ?? 0}</div>
              </div>
              <div className="metric-icon-wrap">
                <Package size={26} />
              </div>
            </div>

            <div className="metric-card">
              <div>
                <div className="metric-title">Registered Customers</div>
                <div className="metric-value">{data?.stats?.totalCustomers ?? 0}</div>
              </div>
              <div className="metric-icon-wrap" style={{ backgroundColor: '#dbeafe', color: '#1d4ed8' }}>
                <Users size={26} />
              </div>
            </div>

            <div className="metric-card">
              <div>
                <div className="metric-title">Total Orders Placed</div>
                <div className="metric-value">{data?.stats?.totalOrders ?? 0}</div>
                {data?.stats?.pendingOrdersCount > 0 && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--warning)', fontWeight: 700, marginTop: '2px' }}>
                    {data.stats.pendingOrdersCount} pending approval
                  </div>
                )}
              </div>
              <div className="metric-icon-wrap" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                <ShoppingBag size={26} />
              </div>
            </div>

            <div className="metric-card">
              <div>
                <div className="metric-title">Delivered Revenue</div>
                <div className="metric-value">${Number(data?.stats?.deliveredRevenue ?? 0).toFixed(2)}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted-text)', marginTop: '2px' }}>
                  Delivered COD orders
                </div>
              </div>
              <div className="metric-icon-wrap" style={{ backgroundColor: '#d1fae5', color: '#059669' }}>
                <DollarSign size={26} />
              </div>
            </div>
          </div>

          {/* Recent Orders & Activities Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2rem', alignItems: 'flex-start' }}>
            {/* Recent Orders */}
            <div className="table-card">
              <div className="table-header">
                <h2 className="table-title">Recent Customer Orders</h2>
                <Link to="/admin/orders" style={{ color: 'var(--secondary-blue)', fontWeight: 600, fontSize: '0.88rem' }}>
                  Manage All Orders <ArrowRight size={14} style={{ verticalAlign: 'middle' }} />
                </Link>
              </div>

              <div className="table-wrap">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(!data?.recentOrders || data.recentOrders.length === 0) ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted-text)' }}>
                          No orders recorded yet.
                        </td>
                      </tr>
                    ) : (
                      data.recentOrders.map((ord) => (
                        <tr key={ord._id}>
                          <td style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>
                            #{ord._id.slice(-6).toUpperCase()}
                          </td>
                          <td>{ord.customerName}</td>
                          <td style={{ fontWeight: 700 }}>${Number(ord.total).toFixed(2)}</td>
                          <td>
                            <span className={`status-badge status-${ord.status}`}>
                              {ord.status}
                            </span>
                          </td>
                          <td>
                            <Link
                              to={`/admin/orders/${ord._id}`}
                              style={{ color: 'var(--secondary-blue)', fontWeight: 600, fontSize: '0.85rem' }}
                            >
                              Manage
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Activity Log */}
            <div className="table-card">
              <div className="table-header">
                <h2 className="table-title">Audit Trail (Recent)</h2>
                <Link to="/admin/activities" style={{ color: 'var(--secondary-blue)', fontWeight: 600, fontSize: '0.88rem' }}>
                  View All Logs <ArrowRight size={14} style={{ verticalAlign: 'middle' }} />
                </Link>
              </div>

              <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(!data?.recentActivities || data.recentActivities.length === 0) ? (
                  <p style={{ color: 'var(--muted-text)', fontSize: '0.9rem' }}>No activity records found.</p>
                ) : (
                  data.recentActivities.map((act) => (
                    <div key={act._id} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--muted-text)' }}>
                        <span style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>{act.userName} ({act.role})</span>
                        <span>{new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div style={{ fontSize: '0.88rem', color: 'var(--dark-text)', marginTop: '3px' }}>
                        {act.description}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
