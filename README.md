<div align="center">

<img src="https://img.shields.io/badge/StoryVerse-AI-8b5cf6?style=for-the-badge&logo=bookstack&logoColor=white" alt="StoryVerse AI" />

# 📖 StoryVerse AI

**An immersive full-stack platform for reading and creating visual novels, powered by AI.**

*Read. Visualize. Create.*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-storyverse--smoky.vercel.app-8b5cf6?style=flat-square&logo=vercel&logoColor=white)](https://storyverse-smoky.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-indigo?style=flat-square)](./LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb)](https://mongodb.com)

</div>

---

## ✨ Overview

**StoryVerse AI** is a full-stack MERN application that bridges the gap between readers and storytellers. It provides an infinite library of beautifully illustrated visual novels alongside a professional-grade **Creator Studio** where authors can write, generate AI art, and publish serialized stories — all in one place.

> 🌐 **Live at:** [storyverse-smoky.vercel.app](https://storyverse-smoky.vercel.app)

---

## 🚀 Key Features

### For Readers
- 📚 **Immersive Reading Mode** — Distraction-free, book-like reading experience with smooth scroll and chapter navigation
- 🔍 **Explore & Discover** — Browse trending stories with genre filters and search
- 🔖 **Personal Library** — Bookmark favorites and track reading progress across chapters
- 💬 **Social Engagement** — Comment on chapters and like stories

### For Creators
- ✍️ **Rich Text Editor** — Tiptap-powered editor with full formatting, drag-and-drop block reordering
- 🎨 **AI Image Generation** — Generate stunning anime-style art directly from scene descriptions (Hugging Face API)
- 🤖 **AI Writing Assistant** — Get intelligent suggestions, summaries, and continuation ideas (Google Gemini API)
- 📊 **Creator Analytics Dashboard** — Track views, likes, reads, and chapter-level performance
- 📂 **Chapter Management** — Organize, reorder, and publish chapters with a visual dashboard

### Platform
- 🔐 **Secure Authentication** — JWT-based auth with bcrypt password hashing
- ☁️ **Media Uploads** — Cloudinary integration for cover images and story art
- 🛡️ **Production-Grade Security** — Helmet, rate limiting, MongoDB sanitization, CORS protection
- ✨ **Cinematic Landing Page** — Particle backgrounds, cursor glow, parallax scrolling, and Framer Motion animations

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **Vite 8** | Build tool & dev server |
| **React Router v7** | Client-side routing |
| **Tailwind CSS v4** | Utility-first styling |
| **Framer Motion** | Animations & parallax effects |
| **Tiptap** | Rich text / chapter editor |
| **Zustand** | Global state management |
| **Axios** | HTTP client |
| **Lenis** | Smooth scroll |
| **tsParticles** | Particle background effects |
| **dnd-kit** | Drag-and-drop chapter reordering |
| **Lucide React** | Icon library |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express 5** | REST API server |
| **MongoDB + Mongoose** | Database & ODM |
| **JSON Web Token (JWT)** | Authentication |
| **bcrypt** | Password hashing |
| **Cloudinary** | Image storage & CDN |
| **Multer** | File upload handling |
| **Google Gemini API** | AI writing assistant |
| **Groq SDK** | Fast AI inference |
| **Helmet** | Security headers |
| **express-rate-limit** | Rate limiting |
| **express-mongo-sanitize** | NoSQL injection prevention |

---

## 📁 Project Structure

```
StoryVerse/
├── frontend/storyverse/
│   └── src/
│       ├── pages/              # Route-level page components
│       │   ├── LandingPage.jsx
│       │   ├── Home.jsx
│       │   ├── Explore.jsx
│       │   ├── StoryDetail.jsx
│       │   ├── Reader.jsx
│       │   ├── Library.jsx
│       │   ├── Profile.jsx
│       │   ├── Editor.jsx      # Creator rich-text editor
│       │   ├── Dashboard.jsx   # Creator dashboard
│       │   └── CreatorAnalytics.jsx
│       ├── components/         # Reusable UI components
│       │   ├── layout/         # RootLayout, CreatorLayout
│       │   ├── auth/           # ProtectRoute, auth guards
│       │   ├── editor/         # Tiptap editor components
│       │   ├── cards/          # Story cards, chapter cards
│       │   ├── ui/             # Generic UI primitives
│       │   └── ...             # Particles, FloatingCharacter, etc.
│       ├── store/              # Zustand state stores
│       ├── context/            # React context (auth, etc.)
│       └── utils/              # Helpers & API utilities
│
└── backend/
    ├── config/                 # DB connection
    ├── controllers/            # Business logic per resource
    ├── middleware/             # Auth, error handling
    ├── models/                 # Mongoose schemas
    │   ├── User.js
    │   ├── Story.js
    │   ├── Chapter.js
    │   ├── Comment.js
    │   ├── Bookmark.js
    │   ├── Progress.js
    │   └── AIGeneration.js
    ├── routes/                 # Express route definitions
    │   ├── authRoutes.js
    │   ├── storyRoutes.js
    │   ├── chapterRoutes.js
    │   ├── uploadRoutes.js
    │   ├── bookmarkRoutes.js
    │   ├── commentRoutes.js
    │   └── aiRoutes.js
    └── server.js
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js 18+
- MongoDB instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- Cloudinary account
- Google Gemini API key

### 1. Clone the repository

```bash
git clone https://github.com/Orange1008/storyverse.git
cd storyverse
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

GEMINI_API_KEY=your_google_gemini_api_key
HUGGINGFACE_API_KEY=your_huggingface_api_key

FRONTEND_URL=http://localhost:5173
```

Start the backend server:

```bash
node server.js
```

The API will be running at `http://localhost:5000`.

### 3. Frontend Setup

```bash
cd frontend/storyverse
npm install
```

Create a `.env` file in `frontend/storyverse/`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive JWT |
| `GET` | `/api/stories` | Get all published stories |
| `POST` | `/api/stories` | Create a new story |
| `GET` | `/api/stories/:id` | Get story details |
| `GET` | `/api/chapters/:storyId` | Get chapters for a story |
| `POST` | `/api/chapters` | Create a new chapter |
| `POST` | `/api/upload` | Upload cover / art image |
| `GET` | `/api/bookmarks` | Get user's bookmarks |
| `POST` | `/api/bookmarks` | Bookmark a story |
| `POST` | `/api/comments` | Add a comment |
| `POST` | `/api/ai/generate` | AI text / image generation |

---

## 🌐 Deployment

### Frontend — Vercel

1. Connect your GitHub repo to [Vercel](https://vercel.com)
2. Set **Root Directory** to `frontend/storyverse`
3. Add environment variable: `VITE_API_URL=https://your-backend-url.onrender.com/api`
4. Deploy 🚀

### Backend — Render (or Railway)

1. Create a new **Web Service** on [Render](https://render.com)
2. Set **Root Directory** to `backend`
3. **Build Command:** `npm install`
4. **Start Command:** `node server.js`
5. Add all environment variables from the `.env` template above
6. Deploy 🚀

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📜 License

This project is licensed under the [MIT License](./LICENSE).

---

<div align="center">

Made with ✨ magic by [Orange1008](https://github.com/Orange1008)

**[⭐ Star this repo](https://github.com/Orange1008/storyverse)** if you found it useful!

</div>
