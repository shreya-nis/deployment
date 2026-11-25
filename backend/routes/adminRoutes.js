const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getActivityLogs,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

router.use(protect, admin);

router.get('/dashboard', getDashboardStats);
router.get('/activities', getActivityLogs);

module.exports = router;
