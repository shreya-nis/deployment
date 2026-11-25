const User = require('../models/User');
const Order = require('../models/Order');
const { logActivity } = require('../utils/logger');

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Customer
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, user: user.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

// @desc    Update customer profile (own data)
// @route   PUT /api/users/me
// @access  Customer
exports.updateMe = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (address !== undefined) user.address = address.trim();

    // Prevent changing role or email through this route
    await user.save();

    await logActivity({
      user,
      action: 'PROFILE_UPDATED',
      description: `Customer updated profile information: ${user.name}`,
      relatedId: user._id,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all customers (Admin)
// @route   GET /api/users
// @access  Admin
exports.getAllUsersAdmin = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    // Enrich each user with their order count
    const enrichedUsers = await Promise.all(
      users.map(async (u) => {
        const orderCount = await Order.countDocuments({ user: u._id });
        return {
          ...u.toSafeObject(),
          orderCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: enrichedUsers.length,
      users: enrichedUsers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user by ID (Admin)
// @route   GET /api/users/:id
// @access  Admin
exports.getUserByIdAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      user: user.toSafeObject(),
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user details / status (Admin)
// @route   PUT /api/users/:id
// @access  Admin
exports.updateUserAdmin = async (req, res, next) => {
  try {
    const { name, phone, address, isActive, role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Safeguard: Check if deactivating or demoting the last active admin
    if (user.role === 'admin' && (isActive === false || (role && role !== 'admin'))) {
      const activeAdminCount = await User.countDocuments({
        role: 'admin',
        isActive: true,
      });

      if (activeAdminCount <= 1 && user.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Cannot deactivate or demote the last remaining active administrator account',
        });
      }
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (address !== undefined) user.address = address.trim();
    if (isActive !== undefined) user.isActive = Boolean(isActive);
    if (role && ['user', 'admin'].includes(role)) user.role = role;

    await user.save();

    await logActivity({
      user: req.user,
      action: 'USER_UPDATED',
      description: `Admin updated user record: "${user.name}" (${user.email}) - Active: ${user.isActive}`,
      relatedId: user._id,
    });

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account (Admin)
// @route   DELETE /api/users/:id
// @access  Admin
exports.deleteUserAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Safeguard: cannot delete the last active admin
    if (user.role === 'admin') {
      const activeAdminCount = await User.countDocuments({
        role: 'admin',
        isActive: true,
      });
      if (activeAdminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the last remaining administrator account',
        });
      }
    }

    // Check if user has orders: if so, deactivate instead of hard delete to preserve historical integrity
    const hasOrders = await Order.findOne({ user: user._id });
    if (hasOrders) {
      user.isActive = false;
      await user.save();

      await logActivity({
        user: req.user,
        action: 'USER_DEACTIVATED',
        description: `User "${user.name}" has historical orders and was safely deactivated instead of deleted`,
        relatedId: user._id,
      });

      return res.status(200).json({
        success: true,
        message: 'Customer has historical orders and was safely deactivated instead of deleted.',
        user: user.toSafeObject(),
      });
    }

    await User.findByIdAndDelete(req.params.id);

    await logActivity({
      user: req.user,
      action: 'USER_DELETED',
      description: `User "${user.name}" (${user.email}) was permanently deleted`,
      relatedId: user._id,
    });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
