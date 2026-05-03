const Comment = require('../models/Comment');
const Chapter = require('../models/Chapter');

// @desc    Get comments for a specific chapter
// @route   GET /api/comments/:chapterId
// @access  Public
const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ chapterId: req.params.chapterId })
      .populate('authorId', 'username profileImage')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a comment
// @route   POST /api/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { chapterId, content } = req.body;
    
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });

    const comment = await Comment.create({
      chapterId,
      storyId: chapter.storyId,
      authorId: req.user._id,
      content,
    });

    const populatedComment = await comment.populate('authorId', 'username profileImage');
    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.authorId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await comment.deleteOne();
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getComments, addComment, deleteComment };
