const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { streamWriting, getHistory, generateImage } = require('../controllers/aiController');

// SSE streaming writing — auth required so we can save to history
router.post('/stream', protect, streamWriting);

// Fetch last 15 AI generations for a chapter
router.get('/history/:chapterId', protect, getHistory);

// HuggingFace image generation → Cloudinary URL
router.post('/image', protect, generateImage);

module.exports = router;
