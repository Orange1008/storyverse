const express = require('express');
const router = express.Router();
const {
  getMyBookmarks,
  addBookmark,
  removeBookmark,
  checkBookmark,
} = require('../controllers/bookmarkController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getMyBookmarks);
router.get('/check/:storyId', protect, checkBookmark);
router.post('/:storyId', protect, addBookmark);
router.delete('/:storyId', protect, removeBookmark);

module.exports = router;
