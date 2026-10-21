const express = require('express');
const router = express.Router();
const {
  createPost, getPosts, getPostById, addComment, addReply,
  toggleLike, toggleBookmark, reportPost, getBookmarkedPosts, deletePost
} = require('../controllers/forumController');
const { protect } = require('../middleware/auth');

// Bookmarks route must be before /:id parameter route
router.get('/me/bookmarks', protect, getBookmarkedPosts);

// Public
router.get('/', getPosts);
router.get('/:id', getPostById);

// Protected
router.post('/', protect, createPost);
router.post('/:id/comments', protect, addComment);
router.post('/:id/comments/:commentId/reply', protect, addReply);
router.put('/:id/like', protect, toggleLike);
router.put('/:id/bookmark', protect, toggleBookmark);
router.post('/:id/report', protect, reportPost);
router.delete('/:id', protect, deletePost);

module.exports = router;
