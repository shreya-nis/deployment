import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], totalItems: 0, subtotal: 0, total: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) {
      setCart({ items: [], totalItems: 0, subtotal: 0, total: 0 });
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.data && res.data.success) {
        setCart(res.data.cart);
      }
    } catch (error) {
      console.error('Failed to load cart:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'user') {
      fetchCart();
    } else {
      setCart({ items: [], totalItems: 0, subtotal: 0, total: 0 });
    }
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) throw new Error('Please log in to add items to your cart');
    const res = await api.post('/cart', { productId, quantity });
    if (res.data && res.data.success) {
      setCart(res.data.cart);
      return res.data;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (!user) return;
    const res = await api.put(`/cart/${productId}`, { quantity });
    if (res.data && res.data.success) {
      setCart(res.data.cart);
      return res.data;
    }
  };

  const removeFromCart = async (productId) => {
    if (!user) return;
    const res = await api.delete(`/cart/${productId}`);
    if (res.data && res.data.success) {
      setCart(res.data.cart);
      return res.data;
    }
  };

  const clearCart = async () => {
    if (!user) return;
    const res = await api.delete('/cart');
    if (res.data && res.data.success) {
      setCart(res.data.cart);
      return res.data;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
