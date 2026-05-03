const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema(
  {
    storyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Story',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      required: true,
    },
    isDraft: {
      type: Boolean,
      default: true,
    },
    wordCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Auto-compute wordCount before saving (Mongoose 9 async style — no `next` param)
chapterSchema.pre('save', async function () {
  if (this.content) {
    this.wordCount = this.content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
  }
});


module.exports = mongoose.model('Chapter', chapterSchema);
