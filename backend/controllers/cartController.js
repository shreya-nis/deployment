const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { logActivity } = require('../utils/logger');

// Helper to format cart and calculate live totals
const formatCartResponse = (cart) => {
  let subtotal = 0;
  let totalItems = 0;
  const items = [];
  let hasUnavailableItems = false;

  for (const item of cart.items) {
    if (item.product) {
      const p = item.product;
      const isAvailable = p.isActive && p.stock >= item.quantity;
      if (!isAvailable) {
        hasUnavailableItems = true;
      }
      const itemTotal = p.price * item.quantity;
      subtotal += itemTotal;
      totalItems += item.quantity;

      items.push({
        product: {
          _id: p._id,
          name: p.name,
          price: p.price,
          image: p.image,
          category: p.category,
          stock: p.stock,
          isActive: p.isActive,
        },
        quantity: item.quantity,
        itemTotal,
        isAvailable,
      });
    }
  }

  return {
    _id: cart._id,
    user: cart.user,
    items,
    totalItems,
    subtotal: Math.round(subtotal * 100) / 100,
    total: Math.round(subtotal * 100) / 100, // No extra tax/shipping for simple COD
    hasUnavailableItems,
  };
};

// @desc    Get logged in user cart
// @route   GET /api/cart
// @access  Customer
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    res.status(200).json({
      success: true,
      cart: formatCartResponse(cart),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add product to cart
// @route   POST /api/cart
// @access  Customer
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const qty = parseInt(quantity, 10);

    if (!productId || isNaN(qty) || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid productId and positive quantity are required',
      });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product is currently not available',
      });
    }

    if (product.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Product is out of stock',
      });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    let newQuantity = qty;
    if (itemIndex > -1) {
      newQuantity = cart.items[itemIndex].quantity + qty;
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more than available stock (${product.stock} in stock)`,
        });
      }
      cart.items[itemIndex].quantity = newQuantity;
    } else {
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Requested quantity exceeds available stock (${product.stock} in stock)`,
        });
      }
      cart.items.push({ product: productId, quantity: newQuantity });
    }

    await cart.save();
    cart = await Cart.findById(cart._id).populate('items.product');

    await logActivity({
      user: req.user,
      action: 'CART_ADD',
      description: `Added "${product.name}" (qty: ${qty}) to cart`,
      relatedId: product._id,
    });

    res.status(200).json({
      success: true,
      message: 'Product added to cart',
      cart: formatCartResponse(cart),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update quantity of product in cart
// @route   PUT /api/cart/:productId
// @access  Customer
exports.updateCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const qty = parseInt(quantity, 10);

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart',
      });
    }

    if (qty <= 0) {
      // Remove item if quantity is 0 or less
      cart.items.splice(itemIndex, 1);
    } else {
      const product = await Product.findById(productId);
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Product is no longer available',
        });
      }
      if (qty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} items currently in stock`,
        });
      }
      cart.items[itemIndex].quantity = qty;
    }

    await cart.save();
    cart = await Cart.findById(cart._id).populate('items.product');

    res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart: formatCartResponse(cart),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove single item from cart
// @route   DELETE /api/cart/:productId
// @access  Customer
exports.removeCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();
    cart = await Cart.findById(cart._id).populate('items.product');

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      cart: formatCartResponse(cart),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Customer
exports.clearCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      cart: { items: [], totalItems: 0, subtotal: 0, total: 0 },
    });
  } catch (error) {
    next(error);
  }
};
