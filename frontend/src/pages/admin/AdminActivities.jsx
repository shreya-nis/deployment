import React, { useEffect, useState } from 'react';
import { Activity, ShieldCheck, Clock } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../services/api';

const AdminActivities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/activities');
        if (res.data && res.data.success) {
          setActivities(res.data.activities);
        }
      } catch (err) {
        console.error('Failed to load activity logs:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  return (
    <AdminLayout title="Activity Audit Logs">
      <div style={{ marginBottom: '1.5rem', color: 'var(--muted-text)' }}>
        Immutable backend audit logs recording registrations, logins, cart changes, order updates, and product mutations.
      </div>

      <div className="table-card">
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted-text)' }}>
            Loading audit records...
          </div>
        ) : activities.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted-text)' }}>
            No activity logs recorded yet.
          </div>
        ) : (
          <div className="table-wrap">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor / User</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Event Description</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((act) => (
                  <tr key={act._id}>
                    <td style={{ fontSize: '0.82rem', color: 'var(--muted-text)' }}>
                      {new Date(act.createdAt).toLocaleString()}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>
                        {act.userName || 'System'}
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor:
                            act.role === 'admin'
                              ? '#fee2e2'
                              : act.role === 'user'
                              ? 'var(--light-blue)'
                              : 'var(--light-grey)',
                          color:
                            act.role === 'admin'
                              ? 'var(--danger)'
                              : act.role === 'user'
                              ? 'var(--primary-navy)'
                              : 'var(--muted-text)',
                        }}
                      >
                        {act.role}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--secondary-blue)' }}>
                        {act.action}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.9rem', color: 'var(--dark-text)' }}>
                      {act.description}
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

export default AdminActivities;
