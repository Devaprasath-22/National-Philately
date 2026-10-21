const ForumPost = require('../models/ForumPost');

// @desc    Create post
exports.createPost = async (req, res) => {
  try {
    const { title, content, category, image } = req.body;
    const post = await ForumPost.create({ title, content, category, image, author: req.user._id });
    await post.populate('author', 'name avatar username');
    res.status(201).json(post);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error creating post' });
  }
};

// @desc    Get posts with pagination + filters
exports.getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    const query = { isModerated: false };
    if (category && category !== 'All') query.category = category;
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { content: new RegExp(search, 'i') }
      ];
    }
    const total = await ForumPost.countDocuments(query);
    const posts = await ForumPost.find(query)
      .populate('author', 'name avatar username')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));
    res.json({ posts, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)), total });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single post (increments views)
exports.getPostById = async (req, res) => {
  try {
    const post = await ForumPost.findByIdAndUpdate(
      req.params.id, { $inc: { views: 1 } }, { new: true }
    )
      .populate('author', 'name avatar username')
      .populate('comments.author', 'name avatar username')
      .populate('comments.replies.author', 'name avatar username');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add comment to post
exports.addComment = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    post.comments.push({ author: req.user._id, content: req.body.content });
    await post.save();
    await post.populate('comments.author', 'name avatar username');
    await post.populate('comments.replies.author', 'name avatar username');
    res.status(201).json(post.comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reply to a comment
exports.addReply = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    comment.replies.push({ author: req.user._id, content: req.body.content });
    await post.save();
    await post.populate('comments.author', 'name avatar username');
    await post.populate('comments.replies.author', 'name avatar username');
    res.status(201).json(post.comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Like/Unlike a post
exports.toggleLike = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const idx = post.likes.indexOf(req.user._id);
    if (idx > -1) post.likes.splice(idx, 1);
    else post.likes.push(req.user._id);
    await post.save();
    res.json({ likes: post.likes, likeCount: post.likes.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Bookmark/Unbookmark a post
exports.toggleBookmark = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const idx = post.bookmarks.indexOf(req.user._id);
    if (idx > -1) post.bookmarks.splice(idx, 1);
    else post.bookmarks.push(req.user._id);
    await post.save();
    res.json({ bookmarked: idx === -1, bookmarkCount: post.bookmarks.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Report a post
exports.reportPost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    // Prevent duplicate reports from same user
    const alreadyReported = post.reports.some(r => r.reporter.toString() === req.user._id.toString());
    if (alreadyReported) return res.status(400).json({ message: 'You already reported this post' });
    post.reports.push({ reporter: req.user._id, reason: req.body.reason, details: req.body.details });
    await post.save();
    res.json({ message: 'Post reported. Our moderators will review it.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get bookmarked posts for logged-in user
exports.getBookmarkedPosts = async (req, res) => {
  try {
    const posts = await ForumPost.find({ bookmarks: req.user._id, isModerated: false })
      .populate('author', 'name avatar username')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete post
exports.deletePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await ForumPost.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
