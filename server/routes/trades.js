const express = require('express');
const router = express.Router();
const {
  createTrade,
  getMyTrades,
  getTradeById,
  updateTradeStatus,
  addTradeMessage,
  submitTradeReview
} = require('../controllers/tradeController');
const { protect } = require('../middleware/auth');

// All trade routes require authentication
router.use(protect);

router.post('/', createTrade);
router.get('/', getMyTrades);
router.get('/:id', getTradeById);
router.put('/:id/status', updateTradeStatus);
router.post('/:id/messages', addTradeMessage);
router.post('/:id/review', submitTradeReview);

module.exports = router;
