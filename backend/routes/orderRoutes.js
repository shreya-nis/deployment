const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrdersAdmin,
  updateOrderStatus,
  cancelOrder,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

router.use(protect); // All order routes require authenticated user

router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/', admin, getAllOrdersAdmin);
router.get('/:id', getOrderById);
router.patch('/:id/status', admin, updateOrderStatus);
router.patch('/:id/cancel', cancelOrder);

module.exports = router;
