import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, ShieldCheck, Check, Sparkles, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`);
        if (res.data && res.data.success) {
          setProduct(res.data.product);
        }
      } catch (err) {
        setError(err.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const getImageSrc = (imgPath) => {
    if (!imgPath) return '/images/hero-banner.jpg';
    if (imgPath.startsWith('http')) return imgPath;
    if (imgPath.startsWith('/uploads')) return import.meta.env.PROD ? imgPath : `http://localhost:5000${imgPath}`;
    return imgPath;
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (user.role === 'admin') {
      alert('Administrators cannot place orders using an admin account.');
      return;
    }

    try {
      setAdding(true);
      await addToCart(product._id, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      alert(err.message || 'Failed to add item to cart');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '6rem 0', textAlign: 'center', color: 'var(--muted-text)' }}>
        Loading product details...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--primary-navy)', marginBottom: '1rem' }}>Product Not Found</h2>
        <p style={{ color: 'var(--muted-text)', marginBottom: '1.5rem' }}>
          {error || 'The requested product could not be found or has been discontinued.'}
        </p>
        <Link to="/shop" className="btn-primary">
          <ArrowLeft size={16} /> Back to Shop
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;

  return (
    <div style={{ backgroundColor: 'var(--light-grey)', padding: '3rem 0 5rem' }}>
      <div className="container">
        {/* Breadcrumb Navigation */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/shop"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--secondary-blue)',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={16} /> Back to Catalogue
          </Link>
        </div>

        {/* Product Details Container */}
        <div
          style={{
            backgroundColor: 'var(--white)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-md)',
            display: 'grid',
            gridTemplateColumns: 'minmax(300px, 1fr) 1.2fr',
            gap: '2.5rem',
            padding: '2.5rem',
          }}
        >
          {/* Image Display */}
          <div
            style={{
              backgroundColor: '#fafbfc',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
              maxHeight: '480px',
            }}
          >
            <img
              src={getImageSrc(product.image)}
              alt={product.name}
              style={{ maxHeight: '400px', objectFit: 'contain' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/hero-banner.jpg';
              }}
            />
          </div>

          {/* Product Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span
                style={{
                  backgroundColor: 'var(--light-blue)',
                  color: 'var(--primary-navy)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '0.2rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                {product.category}
              </span>
              {product.isFeatured && (
                <span
                  style={{
                    backgroundColor: 'var(--primary-navy)',
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  Featured
                </span>
              )}
            </div>

            <h1
              style={{
                color: 'var(--primary-navy)',
                fontSize: '2rem',
                fontWeight: 800,
                lineHeight: 1.25,
                marginBottom: '1rem',
              }}
            >
              {product.name}
            </h1>

            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '1rem',
                marginBottom: '1.5rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid var(--border-color)',
              }}
            >
              <span style={{ color: 'var(--primary-navy)', fontSize: '2rem', fontWeight: 800 }}>
                ${Number(product.price).toFixed(2)}
              </span>
              <span
                className={`badge-stock ${isOutOfStock ? 'badge-out-stock' : 'badge-in-stock'}`}
                style={{ position: 'static' }}
              >
                {isOutOfStock ? 'Out of Stock' : `${product.stock} Units In Stock`}
              </span>
            </div>

            <p style={{ color: 'var(--dark-text)', fontSize: '1rem', lineHeight: 1.65, marginBottom: '2rem' }}>
              {product.description}
            </p>

            {/* Quantity Selector & Add to Cart */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--dark-text)' }}>
                  Quantity:
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                  }}
                >
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: 'var(--light-grey)',
                      fontWeight: 700,
                    }}
                  >
                    -
                  </button>
                  <span style={{ padding: '0.5rem 1.25rem', fontWeight: 600 }}>{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock || isOutOfStock}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: 'var(--light-grey)',
                      fontWeight: 700,
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || adding}
                  className="btn-primary"
                  style={{ flexGrow: 1, padding: '0.9rem 1.5rem', fontSize: '1.05rem' }}
                >
                  {added ? (
                    <>
                      <Check size={20} /> Added to Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={20} /> {adding ? 'Adding...' : 'Add to Cart'}
                    </>
                  )}
                </button>
              </div>

              {!user && (
                <p style={{ color: 'var(--muted-text)', fontSize: '0.85rem', marginTop: '0.75rem' }}>
                  * You will be prompted to log in or register before adding to your cart.
                </p>
              )}
            </div>

            {/* Value Highlights */}
            <div
              style={{
                backgroundColor: 'var(--light-grey)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '1.25rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
                fontSize: '0.85rem',
                color: 'var(--primary-navy)',
                fontWeight: 600,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={16} color="var(--secondary-blue)" /> 3 Essential Ceramides
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={16} color="var(--secondary-blue)" /> Fragrance-Free
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={16} color="var(--secondary-blue)" /> Dermatologist Tested
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={16} color="var(--secondary-blue)" /> Cash on Delivery Available
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
