const express = require('express');
const router = express.Router();
const {
  getMe,
  updateMe,
  getAllUsersAdmin,
  getUserByIdAdmin,
  updateUserAdmin,
  deleteUserAdmin,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

router.use(protect);

router.get('/me', getMe);
router.put('/me', updateMe);

router.get('/', admin, getAllUsersAdmin);
router.get('/:id', admin, getUserByIdAdmin);
router.put('/:id', admin, updateUserAdmin);
router.delete('/:id', admin, deleteUserAdmin);

module.exports = router;
