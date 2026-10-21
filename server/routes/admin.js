const express = require('express');
const router = express.Router();
const {
  getDashboardStats, getUsers, toggleUserActive, deleteUser,
  getReportedPosts, moderatePost, togglePinPost
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id/toggle-active', toggleUserActive);
router.delete('/users/:id', deleteUser);
router.get('/reports', getReportedPosts);
router.put('/posts/:id/moderate', moderatePost);
router.put('/posts/:id/pin', togglePinPost);

module.exports = router;
