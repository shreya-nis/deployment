import React, { useEffect, useState } from 'react';
import { Users, CheckCircle2, XCircle, ShieldCheck, Trash2 } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';

const AdminCustomers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      if (res.data && res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Failed to load users:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleActive = async (user) => {
    const newStatus = !user.isActive;
    const actionWord = newStatus ? 'activate' : 'deactivate';

    if (!window.confirm(`Are you sure you want to ${actionWord} the account for ${user.name}?`)) {
      return;
    }

    try {
      await api.put(`/users/${user._id}`, { isActive: newStatus });
      fetchUsers();
    } catch (err) {
      alert(err.message || `Failed to ${actionWord} user`);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete or deactivate ${user.name}?`)) {
      return;
    }

    try {
      const res = await api.delete(`/users/${user._id}`);
      alert(res.data?.message || 'User account updated');
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to remove user');
    }
  };

  return (
    <AdminLayout title="Customer Accounts">
      <div style={{ marginBottom: '1.5rem', color: 'var(--muted-text)' }}>
        View registered customer profiles, track order frequency, and manage account authorization status.
      </div>

      <div className="table-card">
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted-text)' }}>
            Loading customer accounts...
          </div>
        ) : (
          <div className="table-wrap">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact Info</th>
                  <th>Role</th>
                  <th>Orders Placed</th>
                  <th>Member Since</th>
                  <th>Status</th>
                  <th>Account Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>{u.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted-text)' }}>{u.email}</div>
                    </td>
                    <td>
                      <div>{u.phone || 'No phone'}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--muted-text)' }}>{u.address || 'No address'}</div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          backgroundColor: u.role === 'admin' ? '#fee2e2' : 'var(--light-blue)',
                          color: u.role === 'admin' ? 'var(--danger)' : 'var(--primary-navy)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>
                        {u.orderCount ?? 0} orders
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      {u.isActive ? (
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
                          <XCircle size={14} /> Deactivated
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleToggleActive(u)}
                          style={{
                            padding: '0.35rem 0.75rem',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: u.isActive ? 'var(--warning-bg)' : '#d1fae5',
                            color: u.isActive ? 'var(--warning)' : '#059669',
                          }}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          style={{
                            padding: '0.35rem 0.6rem',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--danger-bg)',
                            color: 'var(--danger)',
                          }}
                          title="Delete or safely deactivate user"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
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

export default AdminCustomers;
