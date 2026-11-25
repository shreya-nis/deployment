import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ padding: '5rem 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--muted-text)', fontSize: '1.1rem' }}>Checking authorization...</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login?admin=true" replace />;
  }

  return children;
};

export default AdminRoute;
