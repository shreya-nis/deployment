import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User as UserIcon, LogOut, ShieldCheck, Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setAccountMenuOpen(false);
    navigate('/');
  };

  const isActivePath = (path) => location.pathname === path;

  return (
    <header className="header">
      {/* Announcement Bar */}
      <div className="announcement-bar">
        <span>Developed with Dermatologists • Free Standard Delivery on All COD Orders</span>
      </div>

      {/* Main Navigation */}
      <div className="container">
        <div className="nav-container">
          {/* Brand Logo */}
          <Link to="/" className="brand-logo">
            <span className="brand-title">GlowSkin</span>
            <span className="brand-subtitle">Dermatological Skincare</span>
          </Link>

          {/* Desktop Navigation Links */}
          <ul className="nav-links">
            <li>
              <Link to="/" className={`nav-link ${isActivePath('/') ? 'active' : ''}`}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/shop" className={`nav-link ${isActivePath('/shop') ? 'active' : ''}`}>
                Shop All
              </Link>
            </li>
            <li>
              <Link to="/shop?category=Cleansers" className="nav-link">
                Cleansers
              </Link>
            </li>
            <li>
              <Link to="/shop?category=Moisturizers" className="nav-link">
                Moisturizers
              </Link>
            </li>
            <li>
              <Link to="/shop?category=Serums" className="nav-link">
                Serums
              </Link>
            </li>
          </ul>

          {/* Right Action Icons & Buttons */}
          <div className="nav-actions">
            {isAdmin ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Link to="/admin" className="action-btn action-btn-primary">
                  <ShieldCheck size={16} />
                  Admin Panel
                </Link>
                <button onClick={handleLogout} className="action-btn action-btn-outline" title="Log Out">
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            ) : isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Cart Icon */}
                <Link to="/cart" className="cart-icon-btn" title="View Cart">
                  <ShoppingBag size={22} />
                  {cart.totalItems > 0 && <span className="cart-badge">{cart.totalItems}</span>}
                </Link>

                {/* Account Menu */}
                <div className="user-menu-wrap">
                  <button
                    onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                    className="action-btn action-btn-outline"
                    style={{ gap: '0.4rem' }}
                  >
                    <UserIcon size={16} />
                    <span>{user?.name?.split(' ')[0] || 'Account'}</span>
                    <ChevronDown size={14} />
                  </button>

                  {accountMenuOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: '110%',
                        backgroundColor: '#fff',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        boxShadow: 'var(--shadow-md)',
                        minWidth: '180px',
                        zIndex: 1000,
                        overflow: 'hidden',
                      }}
                    >
                      <Link
                        to="/account"
                        onClick={() => setAccountMenuOpen(false)}
                        style={{ display: 'block', padding: '0.75rem 1rem', fontSize: '0.9rem', borderBottom: '1px solid #f0f0f0' }}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/account/orders"
                        onClick={() => setAccountMenuOpen(false)}
                        style={{ display: 'block', padding: '0.75rem 1rem', fontSize: '0.9rem', borderBottom: '1px solid #f0f0f0' }}
                      >
                        My Orders
                      </Link>
                      <Link
                        to="/account/profile"
                        onClick={() => setAccountMenuOpen(false)}
                        style={{ display: 'block', padding: '0.75rem 1rem', fontSize: '0.9rem', borderBottom: '1px solid #f0f0f0' }}
                      >
                        Profile Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '0.75rem 1rem',
                          fontSize: '0.9rem',
                          color: 'var(--danger)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <LogOut size={15} /> Log Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Link to="/login" className="action-btn action-btn-outline">
                  Log In
                </Link>
                <Link to="/register" className="action-btn action-btn-primary">
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ display: 'none' }}
              className="mobile-toggle"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
