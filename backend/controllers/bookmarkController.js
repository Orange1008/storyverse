const Bookmark = require('../models/Bookmark');
const Story = require('../models/Story');

// @desc    Get all bookmarks (full story details) for logged-in user
// @route   GET /api/bookmarks
// @access  Private
const getMyBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.user._id }).populate({
      path: 'storyId',
      populate: { path: 'authorId', select: 'username profileImage' },
    });

    // Return the populated story objects directly (filter out nulls if story was deleted)
    const stories = bookmarks
      .map((b) => b.storyId)
      .filter(Boolean);

    res.json(stories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a story to bookmarks
// @route   POST /api/bookmarks/:storyId
// @access  Private
const addBookmark = async (req, res) => {
  try {
    const { storyId } = req.params;

    // Verify story exists
    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    const bookmark = new Bookmark({ userId: req.user._id, storyId });
    await bookmark.save();

    res.status(201).json({ message: 'Story bookmarked', storyId });
  } catch (error) {
    // Duplicate key error (already bookmarked)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Already bookmarked' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove a story from bookmarks
// @route   DELETE /api/bookmarks/:storyId
// @access  Private
const removeBookmark = async (req, res) => {
  try {
    const { storyId } = req.params;
    const result = await Bookmark.findOneAndDelete({
      userId: req.user._id,
      storyId,
    });

    if (!result) {
      return res.status(404).json({ message: 'Bookmark not found' });
    }

    res.json({ message: 'Bookmark removed', storyId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check if a specific story is bookmarked by the user
// @route   GET /api/bookmarks/check/:storyId
// @access  Private
const checkBookmark = async (req, res) => {
  try {
    const { storyId } = req.params;
    const bookmark = await Bookmark.findOne({
      userId: req.user._id,
      storyId,
    });
    res.json({ isBookmarked: !!bookmark });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMyBookmarks, addBookmark, removeBookmark, checkBookmark };
