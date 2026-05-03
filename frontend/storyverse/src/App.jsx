import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

/* Layouts */
import RootLayout from './components/layout/RootLayout';
import CreatorLayout from './components/layout/CreatorLayout';
import ProtectRoute from './components/auth/ProtectRoute';

/* Public */
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';

/* Protected */
import Home from './pages/Home';
import Explore from './pages/Explore';
import StoryDetail from './pages/StoryDetail';
import Reader from './pages/Reader';
import Library from './pages/Library';
import Profile from './pages/Profile';

/* Creator */
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import CreatorAnalytics from './pages/CreatorAnalytics';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* PROTECTED */}
        <Route element={<ProtectRoute />}>

          {/* USER AREA */}
          <Route element={<RootLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/library" element={<Library />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/story/:id" element={<StoryDetail />} />
          </Route>

          {/* READER MODE */}
          <Route path="/reader/:id" element={<Reader />} />

          {/* CREATOR AREA */}
          <Route path="/creator" element={<CreatorLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="editor" element={<Editor />} />
            <Route path="analytics" element={<CreatorAnalytics />} />
          </Route>

        </Route>

      </Routes>
    </BrowserRouter>
  );
};

export default App;