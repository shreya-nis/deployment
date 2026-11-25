import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, loading } = useCart();
  const navigate = useNavigate();

  const getImageSrc = (imgPath) => {
    if (!imgPath) return '/images/hero-banner.jpg';
    if (imgPath.startsWith('http')) return imgPath;
    if (imgPath.startsWith('/uploads')) return import.meta.env.PROD ? imgPath : `http://localhost:5000${imgPath}`;
    return imgPath;
  };

  if (loading) {
    return (
      <div style={{ padding: '6rem 0', textAlign: 'center', color: 'var(--muted-text)' }}>
        Loading your cart...
      </div>
    );
  }

  const items = cart.items || [];

  if (items.length === 0) {
    return (
      <div style={{ backgroundColor: 'var(--light-grey)', minHeight: '75vh', padding: '5rem 0' }}>
        <div className="container">
          <div
            style={{
              backgroundColor: 'var(--white)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              maxWidth: '600px',
              margin: '0 auto',
              padding: '4rem 2rem',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                backgroundColor: 'var(--light-blue)',
                color: 'var(--secondary-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
              }}
            >
              <ShoppingBag size={32} />
            </div>
            <h2 style={{ color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>Your Cart is Empty</h2>
            <p style={{ color: 'var(--muted-text)', marginBottom: '2rem' }}>
              Explore our dermatologist-formulated skincare products and find the right match for your skin barrier.
            </p>
            <Link to="/shop" className="btn-primary">
              Browse Catalogue <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--light-grey)', minHeight: '80vh', padding: '3rem 0 5rem' }}>
      <div className="container">
        <h1 className="section-title" style={{ marginBottom: '1.5rem' }}>
          Shopping Cart ({cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'})
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '2rem', alignItems: 'flex-start' }}>
          {/* Cart Items List */}
          <div
            style={{
              backgroundColor: 'var(--white)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>Item Details</span>
              <button
                onClick={clearCart}
                style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 600 }}
              >
                Clear Cart
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {items.map((item, idx) => {
                const p = item.product || {};
                return (
                  <div
                    key={p._id || idx}
                    style={{
                      padding: '1.5rem',
                      display: 'flex',
                      gap: '1.5rem',
                      alignItems: 'center',
                      borderBottom: idx !== items.length - 1 ? '1px solid var(--border-color)' : 'none',
                    }}
                  >
                    <img
                      src={getImageSrc(p.image)}
                      alt={p.name}
                      style={{
                        width: '84px',
                        height: '84px',
                        objectFit: 'contain',
                        backgroundColor: '#fafbfc',
                        padding: '0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/hero-banner.jpg';
                      }}
                    />

                    <div style={{ flexGrow: 1 }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted-text)', textTransform: 'uppercase', fontWeight: 600 }}>
                        {p.category}
                      </span>
                      <Link
                        to={`/products/${p._id}`}
                        style={{ display: 'block', fontWeight: 700, color: 'var(--primary-navy)', fontSize: '1rem', marginTop: '2px' }}
                      >
                        {p.name}
                      </Link>
                      <div style={{ fontSize: '0.9rem', color: 'var(--secondary-blue)', fontWeight: 700, marginTop: '4px' }}>
                        ${Number(p.price).toFixed(2)} each
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <button
                        onClick={() => updateQuantity(p._id, item.quantity - 1)}
                        style={{ padding: '0.35rem 0.75rem', fontWeight: 700, backgroundColor: 'var(--light-grey)' }}
                      >
                        -
                      </button>
                      <span style={{ padding: '0.35rem 0.85rem', fontWeight: 600, fontSize: '0.9rem' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(p._id, item.quantity + 1)}
                        disabled={item.quantity >= p.stock}
                        style={{ padding: '0.35rem 0.75rem', fontWeight: 700, backgroundColor: 'var(--light-grey)' }}
                      >
                        +
                      </button>
                    </div>

                    {/* Line total */}
                    <div style={{ minWidth: '80px', textAlign: 'right', fontWeight: 800, color: 'var(--primary-navy)' }}>
                      ${(p.price * item.quantity).toFixed(2)}
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeFromCart(p._id)}
                      title="Remove item"
                      style={{ color: 'var(--muted-text)', padding: '0.5rem' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div
            style={{
              backgroundColor: 'var(--white)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h3 style={{ color: 'var(--primary-navy)', fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>
              Order Summary
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
              <span style={{ color: 'var(--muted-text)' }}>Subtotal ({cart.totalItems} items):</span>
              <span style={{ fontWeight: 700, color: 'var(--dark-text)' }}>${Number(cart.subtotal).toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
              <span style={{ color: 'var(--muted-text)' }}>Standard Delivery:</span>
              <span style={{ color: 'var(--success)', fontWeight: 700 }}>FREE</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
              <span style={{ color: 'var(--muted-text)' }}>Payment Option:</span>
              <span style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>Cash on Delivery</span>
            </div>

            <div
              style={{
                borderTop: '2px dashed var(--border-color)',
                paddingTop: '1rem',
                marginBottom: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-navy)' }}>Estimated Total:</span>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                ${Number(cart.total).toFixed(2)}
              </span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>

            <div
              style={{
                marginTop: '1.5rem',
                padding: '0.85rem',
                backgroundColor: 'var(--light-blue)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                color: 'var(--primary-navy)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Truck size={20} />
              <span>Cash on Delivery is available for all orders across the country.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
