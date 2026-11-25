const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { logActivity } = require('../utils/logger');

// Exact status list from WORKFLOW_AND_ROLE_REQUIREMENTS.md
const VALID_STATUSES = [
  'Pending',
  'Confirmed',
  'Packed',
  'Shipped',
  'Delivered',
  'Cancelled',
];

// Allowed standard forward transitions
const ALLOWED_FORWARD_TRANSITIONS = {
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Packed', 'Cancelled'],
  Packed: ['Shipped', 'Cancelled'],
  Shipped: ['Delivered'],
  Delivered: [],
  Cancelled: [],
};

// @desc    Place a new COD order
// @route   POST /api/orders
// @access  Customer
exports.createOrder = async (req, res, next) => {
  try {
    const { customerName, email, phone, deliveryAddress, note } = req.body;

    if (!customerName || !email || !phone || !deliveryAddress) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, phone number, and delivery address',
      });
    }

    // Load customer's cart
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty. Please add products before checking out.',
      });
    }

    // Validate products, active status and stock
    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product = item.product;

      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product "${product ? product.name : 'Unknown'}" is no longer available. Please update your cart.`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Only ${product.stock} available.`,
        });
      }

      // Backend price calculation (snapshot)
      const itemPrice = product.price;
      subtotal += itemPrice * item.quantity;

      orderItems.push({
        product: product._id,
        productName: product.name,
        price: itemPrice,
        quantity: item.quantity,
        image: product.image,
      });
    }

    const total = Math.round(subtotal * 100) / 100;

    // Create the order
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      customerName: customerName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      deliveryAddress: deliveryAddress.trim(),
      note: note ? note.trim() : '',
      paymentMethod: 'COD',
      subtotal: Math.round(subtotal * 100) / 100,
      total,
      status: 'Pending',
      stockRestored: false,
      statusHistory: [
        {
          status: 'Pending',
          updatedAt: new Date(),
          updatedBy: req.user.name,
          note: 'Order placed by customer via Cash on Delivery',
        },
      ],
    });

    // Reduce stock quantities
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear the customer's cart
    cart.items = [];
    await cart.save();

    // Log activity
    await logActivity({
      user: req.user,
      action: 'ORDER_PLACED',
      description: `Customer placed order #${order._id.toString().slice(-6)} ($${total}) [COD]`,
      relatedId: order._id,
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! Payment will be collected on delivery.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in customer's orders
// @route   GET /api/orders/my-orders
// @access  Customer
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Customer (own order) / Admin
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Authorization check
    if (
      req.user.role !== 'admin' &&
      order.user.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot view orders that do not belong to you',
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Admin
exports.getAllOrdersAdmin = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order fulfilment status (Admin)
// @route   PATCH /api/orders/:id/status
// @access  Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Check if the transition is allowed
    const currentStatus = order.status;
    const allowed = ALLOWED_FORWARD_TRANSITIONS[currentStatus] || [];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition order status from '${currentStatus}' to '${status}'. Allowed: ${allowed.join(', ') || 'None'}`,
      });
    }

    // Handle cancellation stock restoration (EXACTLY ONCE)
    if (status === 'Cancelled' && !order.stockRestored) {
      for (const item of order.items) {
        if (item.product) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity },
          });
        }
      }
      order.stockRestored = true;
    }

    order.status = status;
    order.statusHistory.push({
      status,
      updatedAt: new Date(),
      updatedBy: req.user.name,
      note: note ? note.trim() : `Status updated to ${status} by administrator`,
    });

    await order.save();

    await logActivity({
      user: req.user,
      action: `ORDER_${status.toUpperCase()}`,
      description: `Order #${order._id.toString().slice(-6)} status updated to "${status}"`,
      relatedId: order._id,
    });

    res.status(200).json({
      success: true,
      message: `Order status successfully updated to ${status}`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Customer or Admin cancel order
// @route   PATCH /api/orders/:id/cancel
// @access  Customer (if Pending) / Admin (if eligible)
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const isOwner = order.user.toString() === req.user.id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot modify this order',
      });
    }

    // Customer can only cancel if still Pending
    if (isOwner && !isAdmin && order.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Orders that have already been accepted or processed cannot be cancelled by customer. Please contact support.',
      });
    }

    // Order cannot be cancelled if already Shipped, Delivered or Cancelled
    if (['Shipped', 'Delivered', 'Cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because its current status is '${order.status}'`,
      });
    }

    // Restore stock if not yet restored
    if (!order.stockRestored) {
      for (const item of order.items) {
        if (item.product) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity },
          });
        }
      }
      order.stockRestored = true;
    }

    const oldStatus = order.status;
    order.status = 'Cancelled';
    order.statusHistory.push({
      status: 'Cancelled',
      updatedAt: new Date(),
      updatedBy: req.user.name,
      note: req.body.reason || `Cancelled by ${isAdmin ? 'admin' : 'customer'} (previous: ${oldStatus})`,
    });

    await order.save();

    await logActivity({
      user: req.user,
      action: 'ORDER_CANCELLED',
      description: `Order #${order._id.toString().slice(-6)} was cancelled by ${req.user.name}. Stock restored.`,
      relatedId: order._id,
    });

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully and stock restored',
      order,
    });
  } catch (error) {
    next(error);
  }
};
