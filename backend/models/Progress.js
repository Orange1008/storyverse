const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
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
    lastChapterOrder: {
      type: Number,
      default: 1,
    },
    progressPercentage: {
      type: Number,
      default: 0, // Out of 100
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ReadingProgress', progressSchema);
