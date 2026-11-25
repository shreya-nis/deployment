import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand info */}
          <div className="footer-brand">
            <h3>GlowSkin</h3>
            <p>
              Developed with dermatologists, GlowSkin's mission is to deliver therapeutic skincare for everyone, formulated with three essential ceramides to help restore the skin's natural barrier.
            </p>
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--light-blue)', fontSize: '0.85rem' }}>
              <ShieldCheck size={18} />
              <span>Dermatologist Formulated & Tested</span>
            </div>
          </div>

          {/* Shop categories */}
          <div className="footer-col">
            <h4>Products</h4>
            <ul className="footer-links">
              <li><Link to="/shop">All Products</Link></li>
              <li><Link to="/shop?category=Cleansers">Cleansers</Link></li>
              <li><Link to="/shop?category=Moisturizers">Moisturizers</Link></li>
              <li><Link to="/shop?category=Serums">Serums</Link></li>
              <li><Link to="/shop?category=Sunscreens">Sunscreens</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="footer-col">
            <h4>Customer Care</h4>
            <ul className="footer-links">
              <li><Link to="/cart">My Cart</Link></li>
              <li><Link to="/account/orders">Track Orders</Link></li>
              <li><Link to="/account">My Account</Link></li>
              <li><span>Cash on Delivery Only</span></li>
              <li><span>Free Standard Delivery</span></li>
            </ul>
          </div>

          {/* Contact & Store Info */}
          <div className="footer-col">
            <h4>Store Information</h4>
            <ul className="footer-links" style={{ color: '#c0d3e5', fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} color="var(--light-blue)" />
                <span>100 Medical Plaza, New York, NY</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={16} color="var(--light-blue)" />
                <span>+1 (555) 234-5678</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} color="var(--light-blue)" />
                <span>support@glowskin.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} GlowSkin Skincare Store. Built with strict MERN Stack. Cash on Delivery (COD) Enabled.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
