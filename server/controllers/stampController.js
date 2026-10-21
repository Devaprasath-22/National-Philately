const Stamp = require('../models/Stamp');
const User = require('../models/User');

// @desc    Create stamp
exports.createStamp = async (req, res) => {
  try {
    const stampData = { ...req.body, owner: req.user._id };
    const stamp = await Stamp.create(stampData);
    await stamp.populate('owner', 'name email avatar username');
    res.status(201).json(stamp);
  } catch (error) {
    console.error('Create stamp error:', error);
    res.status(500).json({ message: 'Server error creating stamp' });
  }
};

// @desc    Get all stamps with filtering and pagination
exports.getStamps = async (req, res) => {
  try {
    const {
      page = 1, limit = 12, search, country, category, condition,
      rarity, yearFrom, yearTo, forTrade, theme, sortBy = 'createdAt', order = 'desc'
    } = req.query;

    const query = { isWanted: false }; // Default: show owned stamps only

    if (search) query.$text = { $search: search };
    if (country) query.country = new RegExp(country, 'i');
    if (category) query.category = category;
    if (condition) query.condition = condition;
    if (rarity) query.rarity = rarity;
    if (theme) query.theme = new RegExp(theme, 'i');
    if (forTrade === 'true') query.isForTrade = true;
    if (yearFrom || yearTo) {
      query.year = {};
      if (yearFrom) query.year.$gte = parseInt(yearFrom);
      if (yearTo) query.year.$lte = parseInt(yearTo);
    }

    const sortObj = { [sortBy]: order === 'asc' ? 1 : -1 };
    const total = await Stamp.countDocuments(query);
    const stamps = await Stamp.find(query)
      .populate('owner', 'name email avatar username')
      .sort(sortObj)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({ stamps, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)), total });
  } catch (error) {
    console.error('Get stamps error:', error);
    res.status(500).json({ message: 'Server error fetching stamps' });
  }
};

// @desc    Get single stamp
exports.getStampById = async (req, res) => {
  try {
    const stamp = await Stamp.findById(req.params.id)
      .populate('owner', 'name email avatar location username');
    if (!stamp) return res.status(404).json({ message: 'Stamp not found' });
    res.json(stamp);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update stamp
exports.updateStamp = async (req, res) => {
  try {
    const stamp = await Stamp.findById(req.params.id);
    if (!stamp) return res.status(404).json({ message: 'Stamp not found' });
    if (stamp.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const updated = await Stamp.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('owner', 'name email avatar username');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete stamp
exports.deleteStamp = async (req, res) => {
  try {
    const stamp = await Stamp.findById(req.params.id);
    if (!stamp) return res.status(404).json({ message: 'Stamp not found' });
    if (stamp.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await Stamp.findByIdAndDelete(req.params.id);
    // Also remove from wishlists
    await User.updateMany({ wishlist: req.params.id }, { $pull: { wishlist: req.params.id } });
    res.json({ message: 'Stamp removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get stamps by user
exports.getStampsByUser = async (req, res) => {
  try {
    const stamps = await Stamp.find({ owner: req.params.userId, isWanted: false })
      .populate('owner', 'name email avatar username')
      .sort({ createdAt: -1 });
    res.json(stamps);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get collection dashboard stats for logged-in user
exports.getMyCollectionStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [
      totalStamps, forTradeCount, wantedCount,
      byCategory, byCondition, byRarity, byCountry, totalValue
    ] = await Promise.all([
      Stamp.countDocuments({ owner: userId, isWanted: false }),
      Stamp.countDocuments({ owner: userId, isWanted: false, isForTrade: true }),
      Stamp.countDocuments({ owner: userId, isWanted: true }),
      Stamp.aggregate([
        { $match: { owner: userId, isWanted: false } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Stamp.aggregate([
        { $match: { owner: userId, isWanted: false } },
        { $group: { _id: '$condition', count: { $sum: 1 } } }
      ]),
      Stamp.aggregate([
        { $match: { owner: userId, isWanted: false } },
        { $group: { _id: '$rarity', count: { $sum: 1 } } }
      ]),
      Stamp.aggregate([
        { $match: { owner: userId, isWanted: false } },
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 }
      ]),
      Stamp.aggregate([
        { $match: { owner: userId, isWanted: false, estimatedValue: { $gt: 0 } } },
        { $group: { _id: null, total: { $sum: '$estimatedValue' } } }
      ])
    ]);

    res.json({
      totalStamps,
      forTradeCount,
      wantedCount,
      totalValue: totalValue[0]?.total || 0,
      byCategory,
      byCondition,
      byRarity,
      byCountry
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Wishlist operations
exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'wishlist',
      populate: { path: 'owner', select: 'name username avatar' }
    });
    res.json(user.wishlist || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.toggleWishlist = async (req, res) => {
  try {
    const { stampId } = req.body;
    const user = await User.findById(req.user._id);
    const idx = user.wishlist.indexOf(stampId);
    if (idx > -1) {
      user.wishlist.splice(idx, 1);
    } else {
      user.wishlist.push(stampId);
    }
    await user.save();
    res.json({ wishlist: user.wishlist, added: idx === -1 });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get wanted stamps (own wishlist stamps)
exports.getWantedStamps = async (req, res) => {
  try {
    const stamps = await Stamp.find({ owner: req.params.userId, isWanted: true })
      .populate('owner', 'name avatar username')
      .sort({ createdAt: -1 });
    res.json(stamps);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
