const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getComments, addComment, deleteComment } = require('../controllers/commentController');

router.route('/:chapterId').get(getComments);
router.route('/').post(protect, addComment);
router.route('/:id').delete(protect, deleteComment);

module.exports = router;
