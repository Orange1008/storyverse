const Chapter = require('../models/Chapter');
const Story = require('../models/Story');

// @desc    Create a new chapter for a story
// @route   POST /api/chapters
// @access  Private/Creator
const createChapter = async (req, res) => {
  try {
    const { storyId, title, content, order } = req.body;

    console.log('[createChapter] body:', { storyId, title, order, contentLength: content?.length });

    const story = await Story.findById(storyId);
    if (!story) return res.status(404).json({ message: 'Story not found' });
    if (story.authorId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to add chapters to this story' });
    }

    const chapter = await Chapter.create({ storyId, title, content: content || '', order });

    // Keep chapterCount in sync
    await Story.findByIdAndUpdate(storyId, { chapterCount: await Chapter.countDocuments({ storyId }) });

    res.status(201).json(chapter);
  } catch (error) {
    console.error('[createChapter] ERROR:', error.name, error.message, error.stack);
    res.status(500).json({ message: `${error.name}: ${error.message}` });
  }
};

// @desc    Get all chapters for a specific story
// @route   GET /api/chapters/:storyId
// @access  Public
const getChaptersByStoryId = async (req, res) => {
  try {
    const chapters = await Chapter.find({ storyId: req.params.storyId }).sort({ order: 1 });
    res.json(chapters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a chapter's title and/or content
// @route   PUT /api/chapters/:id
// @access  Private/Creator (author of the story)
const updateChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });

    const story = await Story.findById(chapter.storyId);
    if (!story) return res.status(404).json({ message: 'Story not found' });
    if (story.authorId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to edit this chapter' });
    }

    const { title, content, isDraft } = req.body;
    if (title !== undefined) chapter.title = title;
    if (content !== undefined) chapter.content = content;
    if (isDraft !== undefined) chapter.isDraft = isDraft;

    const saved = await chapter.save(); // pre-save hook computes wordCount
    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a chapter
// @route   DELETE /api/chapters/:id
// @access  Private/Creator
const deleteChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });

    const story = await Story.findById(chapter.storyId);
    if (!story) return res.status(404).json({ message: 'Story not found' });
    if (story.authorId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this chapter' });
    }

    const storyId = chapter.storyId;
    await chapter.deleteOne();

    // Re-number remaining chapters
    const remaining = await Chapter.find({ storyId }).sort({ order: 1 });
    for (let i = 0; i < remaining.length; i++) {
      remaining[i].order = i + 1;
      await remaining[i].save();
    }
    await Story.findByIdAndUpdate(storyId, { chapterCount: remaining.length });

    res.json({ message: 'Chapter removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reorder chapters
// @route   POST /api/chapters/reorder
// @access  Private/Creator
// Body: { storyId, order: [{ _id, order }] }
const reorderChapters = async (req, res) => {
  try {
    const { storyId, order } = req.body;

    const story = await Story.findById(storyId);
    if (!story) return res.status(404).json({ message: 'Story not found' });
    if (story.authorId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updates = order.map(({ _id, order: newOrder }) =>
      Chapter.findByIdAndUpdate(_id, { order: newOrder })
    );
    await Promise.all(updates);

    const chapters = await Chapter.find({ storyId }).sort({ order: 1 });
    res.json(chapters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createChapter,
  getChaptersByStoryId,
  updateChapter,
  deleteChapter,
  reorderChapters,
};
