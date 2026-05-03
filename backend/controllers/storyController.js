const Story = require('../models/Story');
const Chapter = require('../models/Chapter');

// @desc    Get all stories (optionally filter by genre or featured)
// @route   GET /api/stories?genre=Fantasy&featured=true
// @access  Public
const getStories = async (req, res) => {
  try {
    const filter = { status: 'published' }; // Only show published by default
    if (req.query.genre) filter.genre = req.query.genre;
    if (req.query.featured === 'true') filter.isFeatured = true;

    // Sort: ?sort=views → trending, ?sort=createdAt → newest, default → views desc
    const sortField = req.query.sort === 'createdAt' ? { createdAt: -1 }
                    : req.query.sort === 'views'     ? { views: -1 }
                    : { views: -1, createdAt: -1 };

    const stories = await Story.find(filter)
      .populate('authorId', 'username profileImage')
      .sort(sortField);
    res.json(stories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single story
// @route   GET /api/stories/:id
// @access  Public
const getStoryById = async (req, res) => {
  try {
    const story = await Story.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } }, // increment view count on each read
      { returnDocument: 'after' }
    ).populate('authorId', 'username profileImage headline bio');

    if (story) {
      res.json(story);
    } else {
      res.status(404).json({ message: 'Story not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a story
// @route   POST /api/stories
// @access  Private (any authenticated user)
const createStory = async (req, res) => {
  try {
    const { title, description, genre, coverImage, coverColor, tags } = req.body;

    const story = new Story({
      title,
      description,
      genre,
      coverImage: coverImage || '',
      coverColor: coverColor || '#7C3AED',
      tags: tags || [],
      authorId: req.user._id,
    });

    const createdStory = await story.save();
    res.status(201).json(createdStory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a story
// @route   PUT /api/stories/:id
// @access  Private (author only)
const updateStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    if (story.authorId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this story' });
    }

    const { title, description, genre, coverImage, coverColor, tags, chapterCount } = req.body;
    if (title !== undefined) story.title = title;
    if (description !== undefined) story.description = description;
    if (genre !== undefined) story.genre = genre;
    if (coverImage !== undefined) story.coverImage = coverImage;
    if (coverColor !== undefined) story.coverColor = coverColor;
    if (tags !== undefined) story.tags = tags;
    if (chapterCount !== undefined) story.chapterCount = chapterCount;

    const updatedStory = await story.save();
    res.json(updatedStory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user's stories (dashboard)
// @route   GET /api/stories/me
// @access  Private
const getMyStories = async (req, res) => {
  try {
    const stories = await Story.find({ authorId: req.user._id }).sort({ createdAt: -1 });
    res.json(stories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like or unlike a story
// @route   POST /api/stories/:id/like
// @access  Private
const likeStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    const alreadyLiked = story.likes.includes(req.user._id);
    if (alreadyLiked) {
      story.likes.pull(req.user._id);
    } else {
      story.likes.push(req.user._id);
    }
    
    await story.save();
    res.json({ likes: story.likes.length, isLiked: !alreadyLiked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a story
// @route   DELETE /api/stories/:id
// @access  Private (author only)
const deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    if (story.authorId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this story' });
    }

    // Also delete all chapters belonging to this story
    await Chapter.deleteMany({ storyId: story._id });
    await story.deleteOne();
    res.json({ message: 'Story and its chapters removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStories,
  getStoryById,
  createStory,
  updateStory,
  deleteStory,
  getMyStories,
  likeStory
};
