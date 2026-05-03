const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect Database
connectDB();

const app = express();

// ── Security Headers (helmet) ──────────────────────────────────────────────
app.use(helmet());

// ── CORS ───────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  process.env.FRONTEND_URL,        // set in production .env
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, mobile apps, same-origin)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// ── Body Parsing ──────────────────────────────────────────────────────────
// Use a single global parser with a generous limit.
// Chapter content (rich HTML from Tiptap) can be large; having multiple parsers
// causes the stream to be consumed twice, crashing with a 500.
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// ── MongoDB Injection Prevention ──────────────────────────────────────────
app.use((req, res, next) => {
  ['body', 'params', 'headers', 'query'].forEach((k) => {
    if (req[k]) {
      mongoSanitize.sanitize(req[k]);
    }
  });
  next();
});

// ── Rate Limiters ─────────────────────────────────────────────────────────
// Strict limiter for auth endpoints (login/register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                     // 10 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' },
});

// General API limiter
const generalLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,  // 10 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please slow down.' },
});

app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ── Mount Routes ──────────────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/stories',   require('./routes/storyRoutes'));
app.use('/api/chapters',  require('./routes/chapterRoutes'));
app.use('/api/upload',    require('./routes/uploadRoutes'));
app.use('/api/bookmarks', require('./routes/bookmarkRoutes'));
app.use('/api/comments',  require('./routes/commentRoutes'));
app.use('/api/ai',        require('./routes/aiRoutes'));

// ── Health Check ──────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'StoryVerse API is running.' });
});

// ── 404 handler ───────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

// ── Global error handler ──────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  // Always send the exact error message for debugging purposes
  res.status(status).json({ message: err.message, stack: err.stack });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
