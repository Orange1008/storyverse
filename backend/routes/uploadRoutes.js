const express = require('express');
const router = express.Router();
const { parser } = require('../config/cloudinary');
const { protect } = require('../middleware/auth');

// @desc    Upload an image to Cloudinary
// @route   POST /api/upload
// @access  Private
router.post('/', protect, parser.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image provided' });
    }
    // Return the secure Cloudinary URL
    res.status(200).json({
      imageUrl: req.file.path,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading image', error: error.message });
  }
});

module.exports = router;
