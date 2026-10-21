const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  register, login, getMe, updateProfile, changePassword,
  forgotPassword, resetPassword, getPublicProfile, getCollectors
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars')
], register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/collectors', getCollectors);
router.get('/profile/:username', getPublicProfile);

// Protected
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);

module.exports = router;
