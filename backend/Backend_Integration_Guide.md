# StoryVerse Backend Integration Guide

Now that your Node.js & Express backend is fully generated and wired up, you need to connect your React frontend to it. Follow this guide to see exactly how to replace your dummy data with live API calls.

## Step 1: Start Your Backend
Before anything else works, ensure your backend server is running.

1. Open your `.env` file in `e:\StoryVerse\backend\.env`.
2. Paste in your `MONGODB_URI` from MongoDB Atlas, and your Cloudinary credentials.
3. Open a terminal inside the backend folder and run:
   ```bash
   npm run start
   # or
   node server.js
   ```

Your backend is now running on `http://localhost:5000`.

---

## Step 2: Authentication & `useAppStore` Update

Instead of assigning dummy user objects, you'll want your `login` function inside your `useAppStore.js` to hit the real endpoint.

### Login Example
```javascript
// Inside a React component or Zustand store:
const handleLogin = async (email, password) => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (response.ok) {
      const userData = await response.json();
      console.log('Logged in!', userData);
      
      // Save token to localStorage and update Zustand state
      localStorage.setItem('storyverse_token', userData.token);
      // setUser(userData); // your global state setter
    } else {
      console.error('Login failed');
    }
  } catch (error) {
    console.error(error);
  }
};
```

> [!IMPORTANT]
> Include the token in subsequent requests by adding it to the `Authorization` header:
> `headers: { 'Authorization': 'Bearer ' + localStorage.getItem('storyverse_token') }`

---

## Step 3: Fetching Stories in `Explore.jsx`

In your `Explore.jsx` and `Home.jsx` files, you currently loop through dummy arrays like `[1,2,3,4,5]`. You can now fetch real stories from MongoDB.

```javascript
import React, { useState, useEffect } from 'react';
import StoryCard from '../components/shared/StoryCard';

const Explore = () => {
  const [stories, setStories] = useState([]);
  
  // Fetch real stories from backend
  useEffect(() => {
    const fetchStories = async () => {
      const res = await fetch('http://localhost:5000/api/stories');
      const data = await res.json();
      setStories(data);
    };
    
    fetchStories();
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stories.map((story) => (
        // Map the real DB ID and Title onto the StoryCard
        <StoryCard key={story._id} id={story._id} title={story.title} genre={story.genre} />
      ))}
    </div>
  );
};
```

---

## Step 4: Uploading Cover Images (Cloudinary)

While creating a story in your Creator Dashboard, your user will want to upload a cover image. Because we used `multer-storage-cloudinary`, you upload the file via `FormData`.

```javascript
// Assuming you have an <input type="file" onChange={handleFileChange} />
const handleImageUpload = async (file) => {
  const formData = new FormData();
  formData.append('image', file); // The key MUST be 'image' as defined in uploadRoutes.js
  
  try {
    const res = await fetch('http://localhost:5000/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('storyverse_token')}` // Protect route
      },
      body: formData
    });
    
    const data = await res.json();
    console.log("Cloudinary URL:", data.imageUrl);
    // You can now save this `data.imageUrl` to your Story data during the Story Creation POST request!
    return data.imageUrl;
    
  } catch (err) {
    console.error("Upload failed", err);
  }
};
```

---

## Step 5: Creating a Story or Chapter

Once you have the image URL (if applicable), send the completed story object.

```javascript
const saveChapter = async (storyId, chapterTitle, editorContent, orderIndex) => {
  const token = localStorage.getItem('storyverse_token');
  
  const res = await fetch(`http://localhost:5000/api/chapters`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      storyId: storyId,
      title: chapterTitle,
      content: editorContent,
      order: orderIndex
    })
  });
  
  if (res.ok) {
    console.log("Chapter saved!");
  }
};
```

> [!TIP]
> Use this function directly inside the "Publish" or "Save Draft" buttons inside your `Editor.jsx` component.

## Summary 
Your frontend can now utilize complete Create, Read, Update, and Delete operations. Swap out dummy functions sequentially by creating custom hooks (e.g. `useFetchStories`) to keep your components clean!
