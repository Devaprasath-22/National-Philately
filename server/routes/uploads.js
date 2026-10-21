const express = require('express');
const router = express.Router();
const { uploadStampImage, uploadAvatar } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');

router.post('/stamp', protect, uploadStampImage);
router.post('/avatar', protect, uploadAvatar);

module.exports = router;
