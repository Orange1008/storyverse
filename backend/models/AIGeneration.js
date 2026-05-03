const mongoose = require('mongoose');

const aiGenerationSchema = new mongoose.Schema(
  {
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    storyId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Story' },
    chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' },
    mode:      { type: String, required: true }, // continue|improve|tone|plot|dialogue|character|image
    tone:      { type: String },                 // only for tone mode
    result:    { type: String, required: true },
  },
  { timestamps: true }
);

// Index for fast chapter history lookup
aiGenerationSchema.index({ chapterId: 1, createdAt: -1 });

module.exports = mongoose.model('AIGeneration', aiGenerationSchema);
