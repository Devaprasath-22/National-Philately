const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Format user response
const formatUser = (user) => ({
  _id: user._id,
  name: user.name,
  username: user.username,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  bio: user.bio,
  location: user.location,
  collectingInterests: user.collectingInterests,
  isPublic: user.isPublic,
  wishlistAlerts: user.wishlistAlerts
});

// @desc    Register
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, username } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, ...(username ? [{ username }] : [])] });
    if (existingUser) return res.status(400).json({ message: 'Email or username already in use' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password: hashedPassword, username });

    res.status(201).json({ ...formatUser(user), token: generateToken(user._id) });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });
    if (!user.isActive) return res.status(403).json({ message: 'Account deactivated. Contact admin.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    res.json({ ...formatUser(user), token: generateToken(user._id) });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -passwordResetToken -passwordResetExpiry');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, location, collectingInterests, avatar, username, isPublic, wishlistAlerts } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check username uniqueness if changed
    if (username && username !== user.username) {
      const taken = await User.findOne({ username });
      if (taken) return res.status(400).json({ message: 'Username already taken' });
      user.username = username;
    }

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (collectingInterests) user.collectingInterests = collectingInterests;
    if (avatar !== undefined) user.avatar = avatar;
    if (isPublic !== undefined) user.isPublic = isPublic;
    if (wishlistAlerts !== undefined) user.wishlistAlerts = wishlistAlerts;

    await user.save();
    res.json({ ...formatUser(user), token: generateToken(user._id) });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Forgot password — generate reset token
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      // Return same message to prevent email enumeration
      return res.json({ message: 'If that email exists, a reset link will be sent' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpiry = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    // In production, email the token. For now, return it in response (dev only).
    res.json({
      message: 'Password reset token generated',
      resetToken, // Remove this in production — use email instead
      note: 'In production, this token would be emailed. Use it at /api/auth/reset-password'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reset password with token
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpiry: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.passwordResetToken = null;
    user.passwordResetExpiry = null;
    await user.save();

    res.json({ message: 'Password reset successful. Please login.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get public profile by username
exports.getPublicProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password -email -passwordResetToken -passwordResetExpiry -wishlistAlerts');

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.isPublic) return res.status(403).json({ message: 'This profile is private' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all collectors (public, for discovery)
exports.getCollectors = async (req, res) => {
  try {
    const { search, interests } = req.query;
    const query = { isPublic: true, isActive: true };

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { username: new RegExp(search, 'i') },
        { location: new RegExp(search, 'i') }
      ];
    }
    if (interests) {
      query.collectingInterests = { $in: interests.split(',').map(i => new RegExp(i.trim(), 'i')) };
    }

    const collectors = await User.find(query)
      .select('name username avatar bio location collectingInterests createdAt')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(collectors);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
