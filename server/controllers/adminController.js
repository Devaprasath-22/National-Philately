const User = require('../models/User');
const Stamp = require('../models/Stamp');
const ForumPost = require('../models/ForumPost');
const Trade = require('../models/Trade');

// @desc    Dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalStamps, totalPosts, totalTrades] = await Promise.all([
      User.countDocuments(),
      Stamp.countDocuments(),
      ForumPost.countDocuments(),
      Trade.countDocuments()
    ]);
    const activeUsers = await User.countDocuments({ isActive: true });
    const pendingTrades = await Trade.countDocuments({ status: 'pending' });
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentSignups = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const reportedPosts = await ForumPost.countDocuments({ 'reports.0': { $exists: true }, isModerated: false });

    const stampsByCategory = await Stamp.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const topCountries = await Stamp.aggregate([
      { $group: { _id: '$country', count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 10 }
    ]);

    res.json({
      totalUsers, totalStamps, totalPosts, totalTrades,
      activeUsers, pendingTrades, recentSignups, reportedPosts,
      stampsByCategory, topCountries
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all users
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { username: new RegExp(search, 'i') }
      ];
    }
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password -passwordResetToken -passwordResetExpiry')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));
    res.json({ users, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Toggle user active
exports.toggleUserActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot deactivate admin accounts' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot delete admin accounts' });
    await Stamp.deleteMany({ owner: req.params.id });
    await ForumPost.deleteMany({ author: req.params.id });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User and data deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get reported posts
exports.getReportedPosts = async (req, res) => {
  try {
    const posts = await ForumPost.find({ 'reports.0': { $exists: true } })
      .populate('author', 'name email username')
      .populate('reports.reporter', 'name email username')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Moderate (hide) a reported post
exports.moderatePost = async (req, res) => {
  try {
    const { action } = req.body; // 'hide' or 'clear'
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (action === 'hide') {
      post.isModerated = true;
    } else if (action === 'clear') {
      post.reports = [];
      post.isModerated = false;
    } else if (action === 'delete') {
      await ForumPost.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Post deleted' });
    }
    await post.save();
    res.json({ message: `Post ${action}d`, post });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Pin/unpin a post
exports.togglePinPost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    post.isPinned = !post.isPinned;
    await post.save();
    res.json({ message: `Post ${post.isPinned ? 'pinned' : 'unpinned'}`, isPinned: post.isPinned });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
