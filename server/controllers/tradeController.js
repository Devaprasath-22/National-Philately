const Trade = require('../models/Trade');
const Stamp = require('../models/Stamp');

// @desc    Create a trade request
// @route   POST /api/trades
exports.createTrade = async (req, res) => {
  try {
    const { receiver, offeredStamps, requestedStamps, message } = req.body;

    if (receiver === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot trade with yourself' });
    }

    const trade = await Trade.create({
      initiator: req.user._id,
      receiver,
      offeredStamps,
      requestedStamps,
      message,
      messages: message ? [{
        sender: req.user._id,
        text: message
      }] : []
    });

    await trade.populate([
      { path: 'initiator', select: 'name avatar username' },
      { path: 'receiver', select: 'name avatar username' },
      { path: 'offeredStamps', select: 'title image country year denomination' },
      { path: 'requestedStamps', select: 'title image country year denomination' },
      { path: 'messages.sender', select: 'name avatar' }
    ]);

    res.status(201).json(trade);
  } catch (error) {
    console.error('Create trade error:', error);
    res.status(500).json({ message: 'Server error creating trade' });
  }
};

// @desc    Get user's trades
// @route   GET /api/trades
exports.getMyTrades = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {
      $or: [{ initiator: req.user._id }, { receiver: req.user._id }]
    };
    if (status) query.status = status;

    const trades = await Trade.find(query)
      .populate('initiator', 'name avatar username')
      .populate('receiver', 'name avatar username')
      .populate('offeredStamps', 'title image country year denomination estimatedValue')
      .populate('requestedStamps', 'title image country year denomination estimatedValue')
      .populate('messages.sender', 'name avatar')
      .populate('review.reviewer', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(trades);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching trades' });
  }
};

// @desc    Get trade by ID
// @route   GET /api/trades/:id
exports.getTradeById = async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id)
      .populate('initiator', 'name avatar email location username')
      .populate('receiver', 'name avatar email location username')
      .populate('offeredStamps')
      .populate('requestedStamps')
      .populate('messages.sender', 'name avatar')
      .populate('review.reviewer', 'name avatar');

    if (!trade) {
      return res.status(404).json({ message: 'Trade not found' });
    }

    // Only participants or admin can view
    if (
      trade.initiator._id.toString() !== req.user._id.toString() &&
      trade.receiver._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to view this trade' });
    }

    res.json(trade);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching trade' });
  }
};

// @desc    Update trade status (accept/reject/cancel/completed)
// @route   PUT /api/trades/:id/status
exports.updateTradeStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const trade = await Trade.findById(req.params.id);

    if (!trade) {
      return res.status(404).json({ message: 'Trade not found' });
    }

    const isInitiator = trade.initiator.toString() === req.user._id.toString();
    const isReceiver = trade.receiver.toString() === req.user._id.toString();

    // Permissions check
    if (status === 'accepted' || status === 'rejected') {
      if (!isReceiver) {
        return res.status(403).json({ message: 'Only the receiver can accept or reject this offer' });
      }
    } else if (status === 'cancelled') {
      if (!isInitiator) {
        return res.status(403).json({ message: 'Only the initiator can cancel this offer' });
      }
    } else if (status === 'completed') {
      if (!isInitiator && !isReceiver) {
        return res.status(403).json({ message: 'Only trade participants can mark as completed' });
      }
    }

    trade.status = status;
    await trade.save();

    await trade.populate([
      { path: 'initiator', select: 'name avatar username' },
      { path: 'receiver', select: 'name avatar username' },
      { path: 'offeredStamps', select: 'title image country year denomination' },
      { path: 'requestedStamps', select: 'title image country year denomination' },
      { path: 'messages.sender', select: 'name avatar' },
      { path: 'review.reviewer', select: 'name avatar' }
    ]);

    res.json(trade);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating status' });
  }
};

// @desc    Add message to trade conversation
// @route   POST /api/trades/:id/messages
exports.addTradeMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    const trade = await Trade.findById(req.params.id);
    if (!trade) return res.status(404).json({ message: 'Trade not found' });

    const isInitiator = trade.initiator.toString() === req.user._id.toString();
    const isReceiver = trade.receiver.toString() === req.user._id.toString();

    if (!isInitiator && !isReceiver && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    trade.messages.push({
      sender: req.user._id,
      text: text.trim(),
      createdAt: new Date()
    });

    await trade.save();
    await trade.populate('messages.sender', 'name avatar username');

    res.status(201).json(trade.messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error adding message' });
  }
};

// @desc    Submit rating and review after trade completion
// @route   POST /api/trades/:id/review
exports.submitTradeReview = async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    const trade = await Trade.findById(req.params.id);
    if (!trade) return res.status(404).json({ message: 'Trade not found' });

    if (trade.status !== 'completed' && trade.status !== 'accepted') {
      return res.status(400).json({ message: 'Reviews can only be left for accepted or completed trades' });
    }

    const isInitiator = trade.initiator.toString() === req.user._id.toString();
    const isReceiver = trade.receiver.toString() === req.user._id.toString();

    if (!isInitiator && !isReceiver) {
      return res.status(403).json({ message: 'Not authorized to review this trade' });
    }

    trade.review = {
      rating: Number(rating) || 5,
      feedback: feedback || '',
      reviewer: req.user._id,
      createdAt: new Date()
    };

    await trade.save();
    await trade.populate('review.reviewer', 'name avatar username');

    res.json(trade);
  } catch (error) {
    res.status(500).json({ message: 'Server error submitting review' });
  }
};
