const User = require('../models/User');
const Story = require('../models/Story');
const jwt = require('jsonwebtoken');

// ── Helpers ────────────────────────────────────────────────────────────────
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Password strength: 8+ chars, uppercase, lowercase, digit, special char
const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

const validatePassword = (pw) => {
  if (!pw || pw.length < 8)               return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(pw))                  return 'Password must contain at least one uppercase letter.';
  if (!/[a-z]/.test(pw))                  return 'Password must contain at least one lowercase letter.';
  if (!/\d/.test(pw))                     return 'Password must contain at least one number.';
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw))
    return 'Password must contain at least one special character (!@#$%^&* …)';
  return null;
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const username = req.body.username?.trim();
    const email    = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    // ── Required fields
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // ── Username: alphanumeric + underscores only, 3-30 chars
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
      return res.status(400).json({
        message: 'Username must be 3-30 characters and contain only letters, numbers, or underscores.',
      });
    }

    // ── Email basic format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    // ── Strong password
    const pwError = validatePassword(password);
    if (pwError) return res.status(400).json({ message: pwError });

    // ── Duplicate check
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'An account with that email or username already exists.' });
    }

    // ── Create user (password hashed by User model pre-save hook)
    const user = await User.create({ username, email, password, role: 'creator' });

    if (user) {
      return res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        headline: user.headline,
        bio: user.bio,
        token: generateToken(user._id),
      });
    }
    res.status(400).json({ message: 'Invalid user data.' });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const email    = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });

    // Use a constant-time compare (matchPassword uses bcrypt.compare)
    const isMatch = user ? await user.matchPassword(password) : false;

    if (!isMatch) {
      // Generic message — never reveal whether email exists
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    return res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      headline: user.headline,
      bio: user.bio,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        headline: user.headline,
        bio: user.bio,
        token: '', // don't expose token here
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all stories authored by the logged-in user
// @route   GET /api/auth/my-stories
// @access  Private
const getMyStories = async (req, res) => {
  try {
    const stories = await Story.find({ authorId: req.user._id }).sort({ updatedAt: -1 });
    res.json(stories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile (bio, headline, profileImage)
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { headline, bio, profileImage } = req.body;
    if (headline !== undefined) user.headline = headline;
    if (bio !== undefined) user.bio = bio;
    if (profileImage !== undefined) user.profileImage = profileImage;

    const updated = await user.save();
    res.json({
      _id: updated._id,
      username: updated.username,
      email: updated.email,
      role: updated.role,
      profileImage: updated.profileImage,
      headline: updated.headline,
      bio: updated.bio,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  getMyStories,
  updateUserProfile,
};
