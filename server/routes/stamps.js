const express = require('express');
const router = express.Router();
const {
  createStamp, getStamps, getStampById, updateStamp, deleteStamp,
  getStampsByUser, getMyCollectionStats, getWishlist, toggleWishlist, getWantedStamps
} = require('../controllers/stampController');
const { protect } = require('../middleware/auth');

// Protected specific routes before /:id
router.get('/me/stats', protect, getMyCollectionStats);
router.get('/me/wishlist', protect, getWishlist);
router.post('/me/wishlist', protect, toggleWishlist);
router.post('/wishlist/toggle', protect, toggleWishlist);

// Public
router.get('/', getStamps);
router.get('/user/:userId', getStampsByUser);
router.get('/wanted/:userId', getWantedStamps);
router.get('/:id', getStampById);

// Protected CRUD
router.post('/', protect, createStamp);
router.put('/:id', protect, updateStamp);
router.delete('/:id', protect, deleteStamp);

module.exports = router;
