import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { Filter, Search } from 'lucide-react';

const Shop = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || 'All';

  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);

  const categories = [
    'All',
    'Cleansers',
    'Moisturizers',
    'Serums',
    'Sunscreens',
    'Eye Care',
    'Body Care',
  ];

  useEffect(() => {
    // If url category changed
    const cat = queryParams.get('category') || 'All';
    setSelectedCategory(cat);
  }, [location.search]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let url = `/products?category=${selectedCategory === 'All' ? '' : selectedCategory}&search=${encodeURIComponent(searchTerm)}`;
        if (sortBy === 'price-low') url += '&sort=price-low';
        if (sortBy === 'price-high') url += '&sort=price-high';
        if (sortBy === 'name') url += '&sort=name';

        const res = await api.get(url);
        if (res.data && res.data.success) {
          setProducts(res.data.products);
        }
      } catch (err) {
        console.error('Failed to load products:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, searchTerm, sortBy]);

  return (
    <div style={{ backgroundColor: 'var(--light-grey)', minHeight: '80vh', padding: '2.5rem 0 4rem' }}>
      <div className="container">
        {/* Page Header */}
        <div style={{ marginBottom: '2rem' }}>
          <span className="section-tag">Storefront</span>
          <h1 className="section-title">All Skincare Products</h1>
          <p style={{ color: 'var(--muted-text)', marginTop: '0.25rem' }}>
            Browse therapeutic skincare formulas for healthy skin barrier function.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div
          style={{
            backgroundColor: 'var(--white)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            marginBottom: '2rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          {/* Category Tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '0.45rem 0.95rem',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  backgroundColor: selectedCategory === cat ? 'var(--primary-navy)' : 'var(--light-grey)',
                  color: selectedCategory === cat ? '#fff' : 'var(--dark-text)',
                  border: '1px solid ' + (selectedCategory === cat ? 'var(--primary-navy)' : 'var(--border-color)'),
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search & Sort Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', minWidth: '220px' }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-text)' }}
              />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.75rem 0.45rem 2.2rem',
                  fontSize: '0.88rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                }}
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '0.45rem 0.75rem',
                fontSize: '0.88rem',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#fff',
                color: 'var(--dark-text)',
              }}
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Product Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--muted-text)' }}>
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div
            style={{
              backgroundColor: 'var(--white)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '4rem 2rem',
              textAlign: 'center',
            }}
          >
            <h3 style={{ color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>No products found</h3>
            <p style={{ color: 'var(--muted-text)' }}>
              Try adjusting your category filter or search keywords.
            </p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
