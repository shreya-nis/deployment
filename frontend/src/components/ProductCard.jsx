import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Eye, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  // Helper for image src (relative upload or direct)
  const getImageSrc = (imgPath) => {
    if (!imgPath) return '/images/hero-banner.jpg';
    if (imgPath.startsWith('http')) return imgPath;
    if (imgPath.startsWith('/uploads')) return import.meta.env.PROD ? imgPath : `http://localhost:5000${imgPath}`;
    return imgPath;
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      // Must log in before using cart per PRD / Workflow
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (user.role === 'admin') {
      alert('Administrators cannot place orders using admin account.');
      return;
    }

    try {
      setAdding(true);
      await addToCart(product._id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    } catch (err) {
      alert(err.message || 'Failed to add product to cart');
    } finally {
      setAdding(false);
    }
  };

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="product-card">
      <Link to={`/products/${product._id}`} className="product-img-wrap">
        {product.isFeatured && <span className="badge-featured">Featured</span>}
        <span className={`badge-stock ${isOutOfStock ? 'badge-out-stock' : 'badge-in-stock'}`}>
          {isOutOfStock ? 'Out of Stock' : 'In Stock'}
        </span>
        <img
          src={getImageSrc(product.image)}
          alt={product.name}
          className="product-img"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/images/hero-banner.jpg';
          }}
        />
      </Link>

      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <Link to={`/products/${product._id}`} className="product-title" title={product.name}>
          {product.name}
        </Link>
        <p className="product-desc-snippet">{product.description}</p>

        <div className="product-price-row">
          <span className="product-price">${Number(product.price).toFixed(2)}</span>
          <span className="product-stock-count">{product.stock} available</span>
        </div>

        <div className="product-card-actions">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || adding}
            className="btn-card-add"
            title={user ? 'Add to Cart' : 'Log in to Add to Cart'}
          >
            {added ? (
              <>
                <Check size={16} /> Added
              </>
            ) : (
              <>
                <ShoppingBag size={15} /> {adding ? 'Adding...' : 'Add to Cart'}
              </>
            )}
          </button>

          <Link to={`/products/${product._id}`} className="btn-card-view">
            <Eye size={15} style={{ marginRight: '4px' }} /> View
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
