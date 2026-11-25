import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layout & Shared
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Public Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Login from './pages/Login';
import Register from './pages/Register';

// Customer Pages
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import UserDashboard from './pages/UserDashboard';
import MyOrders from './pages/MyOrders';
import OrderDetails from './pages/OrderDetails';
import Profile from './pages/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetails from './pages/admin/AdminOrderDetails';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminActivities from './pages/admin/AdminActivities';

// Wrapper for Storefront Layout (Navbar + Footer)
const StoreLayout = ({ children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <Navbar />
    <main style={{ flexGrow: 1 }}>{children}</main>
    <Footer />
  </div>
);

function App() {
  return (
    <Routes>
      {/* Public Storefront Routes */}
      <Route
        path="/"
        element={
          <StoreLayout>
            <Home />
          </StoreLayout>
        }
      />
      <Route
        path="/shop"
        element={
          <StoreLayout>
            <Shop />
          </StoreLayout>
        }
      />
      <Route
        path="/products/:id"
        element={
          <StoreLayout>
            <ProductDetails />
          </StoreLayout>
        }
      />
      <Route
        path="/login"
        element={
          <StoreLayout>
            <Login />
          </StoreLayout>
        }
      />
      <Route
        path="/register"
        element={
          <StoreLayout>
            <Register />
          </StoreLayout>
        }
      />

      {/* Customer Protected Routes */}
      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <StoreLayout>
              <Cart />
            </StoreLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <StoreLayout>
              <Checkout />
            </StoreLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/account"
        element={
          <ProtectedRoute>
            <StoreLayout>
              <UserDashboard />
            </StoreLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/account/orders"
        element={
          <ProtectedRoute>
            <StoreLayout>
              <MyOrders />
            </StoreLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/account/orders/:id"
        element={
          <ProtectedRoute>
            <StoreLayout>
              <OrderDetails />
            </StoreLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/account/profile"
        element={
          <ProtectedRoute>
            <StoreLayout>
              <Profile />
            </StoreLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <AdminRoute>
            <AdminProducts />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/products/new"
        element={
          <AdminRoute>
            <AdminProductForm />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/products/:id/edit"
        element={
          <AdminRoute>
            <AdminProductForm />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <AdminRoute>
            <AdminOrders />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/orders/:id"
        element={
          <AdminRoute>
            <AdminOrderDetails />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/customers"
        element={
          <AdminRoute>
            <AdminCustomers />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/activities"
        element={
          <AdminRoute>
            <AdminActivities />
          </AdminRoute>
        }
      />

      {/* Catch-all 404 Route */}
      <Route
        path="*"
        element={
          <StoreLayout>
            <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
              <h1 style={{ color: 'var(--primary-navy)', fontSize: '3rem', fontWeight: 800 }}>404</h1>
              <p style={{ color: 'var(--muted-text)', margin: '1rem 0 2rem' }}>
                Page not found. The requested URL does not exist.
              </p>
              <a href="/" className="btn-primary">
                Return to Storefront
              </a>
            </div>
          </StoreLayout>
        }
      />
    </Routes>
  );
}

export default App;
