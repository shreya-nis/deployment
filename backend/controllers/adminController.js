const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get dashboard metrics (Admin)
// @route   GET /api/admin/dashboard
// @access  Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalProducts,
      totalCustomers,
      totalOrders,
      pendingOrdersCount,
      revenueResult,
      recentOrders,
      recentActivities,
    ] = await Promise.all([
      // Total active products
      Product.countDocuments({ isActive: true }),

      // Total registered customers
      User.countDocuments({ role: 'user' }),

      // Total orders
      Order.countDocuments(),

      // Orders needing action
      Order.countDocuments({ status: 'Pending' }),

      // Delivered revenue (sum of delivered, non-cancelled orders per PRD)
      Order.aggregate([
        { $match: { status: 'Delivered' } },
        { $group: { _id: null, totalRevenue: { $sum: '$total' } } },
      ]),

      // 5 most recent orders
      Order.find().sort({ createdAt: -1 }).limit(5),

      // 10 most recent activity logs
      ActivityLog.find().sort({ createdAt: -1 }).limit(10),
    ]);

    const deliveredRevenue =
      revenueResult.length > 0 ? Math.round(revenueResult[0].totalRevenue * 100) / 100 : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        totalCustomers,
        totalOrders,
        pendingOrdersCount,
        deliveredRevenue,
      },
      recentOrders,
      recentActivities,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get activity logs (Admin)
// @route   GET /api/admin/activities
// @access  Admin
exports.getActivityLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const [total, activities] = await Promise.all([
      ActivityLog.countDocuments(),
      ActivityLog.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    ]);

    res.status(200).json({
      success: true,
      count: activities.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      activities,
    });
  } catch (error) {
    next(error);
  }
};
