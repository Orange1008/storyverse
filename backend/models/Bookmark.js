const mongoose = require('mongoose');

// Each document represents a single user bookmarking a single story.
// Unique compound index ensures no duplicates.
const bookmarkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    storyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Story',
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent a user from bookmarking the same story twice
bookmarkSchema.index({ userId: 1, storyId: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
