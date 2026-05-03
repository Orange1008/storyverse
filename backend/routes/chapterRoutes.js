const express = require('express');
const router = express.Router();
const {
  createChapter,
  getChaptersByStoryId,
  updateChapter,
  deleteChapter,
  reorderChapters
} = require('../controllers/chapterController');
const { protect } = require('../middleware/auth');

router.route('/')
  .post(protect, createChapter);

router.route('/reorder')
  .post(protect, reorderChapters);

router.route('/:storyId')
  .get(getChaptersByStoryId);

router.route('/:id')
  .put(protect, updateChapter)
  .delete(protect, deleteChapter);

module.exports = router;
