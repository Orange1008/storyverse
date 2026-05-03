const express = require('express');
const router = express.Router();
const {
  getStories,
  getStoryById,
  createStory,
  updateStory,
  deleteStory,
  getMyStories,
  likeStory
} = require('../controllers/storyController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(getStories)
  .post(protect, createStory);

router.route('/me')
  .get(protect, getMyStories);

router.route('/:id/like')
  .post(protect, likeStory);

router.route('/:id')
  .get(getStoryById)
  .put(protect, updateStory)
  .delete(protect, deleteStory);

module.exports = router;
