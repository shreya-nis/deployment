import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Droplets, Sparkles, Truck, Award } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/products?isFeatured=true');
        if (res.data && res.data.success) {
          setFeaturedProducts(res.data.products.slice(0, 4));
        }
      } catch (err) {
        console.error('Error fetching featured products:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const categories = [
    {
      name: 'Cleansers',
      image: '/images/cat-cleansers.jpg',
      desc: 'Gentle, hydrating formulas for daily skin cleansing',
      link: '/shop?category=Cleansers',
    },
    {
      name: 'Moisturizers',
      image: '/images/cat-moisturizers.jpg',
      desc: '24-hour hydration with essential ceramides',
      link: '/shop?category=Moisturizers',
    },
    {
      name: 'Serums',
      image: '/images/cat-serums.jpg',
      desc: 'Targeted treatments with Hyaluronic Acid & Vitamin C',
      link: '/shop?category=Serums',
    },
    {
      name: 'Sunscreens',
      image: '/images/cat-sunscreens.jpg',
      desc: 'Broad spectrum daily mineral and chemical UV protection',
      link: '/shop?category=Sunscreens',
    },
  ];

  return (
    <div>
      {/* Hero Banner Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-grid">
            <div>
              <div className="hero-badge">
                <Sparkles size={14} /> Dermatologist Developed
              </div>
              <h1 className="hero-title">
                Skincare Powered by 3 Essential Ceramides
              </h1>
              <p className="hero-desc">
                Restore and maintain your skin's natural protective barrier with clean, fragrance-free, clinically proven hydration developed alongside leading dermatologists.
              </p>
              <div className="hero-cta-group">
                <Link to="/shop" className="btn-primary">
                  Shop All Products <ArrowRight size={18} />
                </Link>
                <Link to="/shop?category=Cleansers" className="btn-outline">
                  Explore Cleansers
                </Link>
              </div>
            </div>

            <div className="hero-image-wrap">
              <img
                src="/images/hero-banner.jpg"
                alt="GlowSkin Clinical Skincare Collection"
                className="hero-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/uploads/hydrating-cleanser.jpg';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category Section */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Targeted Solutions</span>
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">
              Every formula contains three essential ceramides (1, 3, and 6-II) to help restore and hydrate skin.
            </p>
          </div>

          <div className="category-grid">
            {categories.map((cat) => (
              <Link to={cat.link} key={cat.name} className="category-card">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="category-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/hero-banner.jpg';
                  }}
                />
                <div className="category-content">
                  <h3 className="category-name">{cat.name}</h3>
                  <span className="category-link">
                    Explore Range <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="products-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Best Sellers</span>
            <h2 className="section-title">Featured Skincare Essentials</h2>
            <p className="section-subtitle">
              Our most-recommended therapeutic cleansers, moisturizers, and barrier-repair formulas.
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--muted-text)' }}>
              Loading featured products...
            </div>
          ) : featuredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--muted-text)' }}>
              No products found in catalogue.
            </div>
          ) : (
            <div className="product-grid">
              {featuredProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link to="/shop" className="btn-primary">
              View All Products <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Brand / About Section */}
      <section className="about-section">
        <div className="container">
          <div className="about-grid">
            <div className="about-content">
              <span className="section-tag">The Science of Ceramides</span>
              <h2>Formulated to Protect Your Skin Barrier</h2>
              <p>
                In 2005, GlowSkin researchers partnered with leading dermatologists to develop a breakthrough line of skincare products fortified with a blend of three essential ceramides (ceramides 1, 3, and 6-II), fatty acids, and other lipids.
              </p>
              <p>
                Our patented MultiVesicular Emulsion Technology (MVE) delivers moisturizing ingredients layer by layer over 24 hours, helping keep your skin comfortable and hydrated throughout the day.
              </p>
              <div className="about-pills">
                <span className="about-pill">Fragrance-Free</span>
                <span className="about-pill">Non-Comedogenic</span>
                <span className="about-pill">Hyaluronic Acid</span>
                <span className="about-pill">MVE Technology</span>
                <span className="about-pill">All Skin Types</span>
              </div>
            </div>

            <div>
              <img
                src="/images/about-banner.jpg"
                alt="Dermatologist consultation"
                style={{
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  width: '100%',
                  height: '380px',
                  objectFit: 'cover',
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/hero-banner.jpg';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Info / Value Prop Banner */}
      <section className="info-banner">
        <div className="container">
          <div className="info-banner-grid">
            <div className="info-item">
              <Award size={36} className="info-item-icon" />
              <h3 className="info-item-title">#1 Dermatologist Recommended</h3>
              <p className="info-item-desc">
                Clinically tested and trusted by dermatologists for dry, sensitive, oily, and blemish-prone skin.
              </p>
            </div>
            <div className="info-item">
              <Droplets size={36} className="info-item-icon" />
              <h3 className="info-item-title">3 Essential Ceramides</h3>
              <p className="info-item-desc">
                Identical to the ceramides naturally present in your skin to restore barrier health.
              </p>
            </div>
            <div className="info-item">
              <Truck size={36} className="info-item-icon" />
              <h3 className="info-item-title">Cash on Delivery (COD)</h3>
              <p className="info-item-desc">
                Convenient payment right at your doorstep upon receiving your skincare package.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
