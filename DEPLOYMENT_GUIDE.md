# 🚀 Kerala Connect Deployment Guide (Railway Edition)

This guide will walk you through hosting your application for free using **Railway** (for the backend) and **Vercel** (for the frontend).

---

## 1. Backend: Hosting on [Railway](https://railway.app/)

Railway is extremely fast and developer-friendly. It will use the `Procfile` I've added to your backend.

### Steps:
1.  **Sign Up/Login** to Railway and connect your GitHub account.
2.  Click **+ New Project** > **Deploy from GitHub repo**.
3.  Select your repository: `Kerala-Connect`.
4.  **Before deploying**, Railway might ask for "Service" settings:
    *   **Root Directory**: Set this to `Kerala-Connect-backend_with_frontend/backend`.
5.  **Variables**: Go to the **Variables** tab and add:
    *   `MONGODB_URI`: `mongodb+srv://Admin:CxaRzVxuKJPu0HgC@storage.xg8hzng.mongodb.net/kerala-connect?retryWrites=true&w=majority&appName=Storage`
    *   `JWT_SECRET`: (Create a random secret string)
    *   `PORT`: `5000` (Railway will assign one, but 5000 is your default)
    *   `NODE_ENV`: `production`
6.  **Deploy**: Once variables are set, Railway will automatically redeploy.
7.  **Generate Domain**: Go to **Settings** > **Public Networking** > **Generate Domain**.
8.  **Note your URL**: You'll get a URL like `https://backend-production-xxxx.up.railway.app`. **Copy this.**

---

## 2. Frontend: Hosting on [Vercel](https://vercel.com/)

I still recommend Vercel for the frontend because it's permanently free for hobbyists and optimized for Vite.

### Steps:
1.  **Sign Up/Login** to Vercel and connect your GitHub account.
2.  Click **Add New** > **Project**.
3.  Select your repository: `Kerala-Connect`.
4.  **Configure Project**:
    *   **Framework Preset**: `Vite`
    *   **Root Directory**: `acad-ex` (Click "Edit" and select the `acad-ex` folder)
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
5.  **Environment Variables**: Add:
    *   `VITE_API_URL`: `https://your-railway-url.up.railway.app/api` (Replace with your Railway domain)
6.  **Deploy**: Click "Deploy".

---

## 3. Why the Procfile?
The `Procfile` tells Railway (and other platforms) exactly how to start your app: `web: node server.js`. It's a standard way to define your process types.

---

## 4. Post-Deployment Checklist

### CORS Setup
In Railway, add a variable:
*   `FRONTEND_URL`: `https://your-vercel-url.vercel.app` (Your live frontend URL)

### MongoDB Access
Ensure your MongoDB Atlas "IP Access List" includes `0.0.0.0/0` (Allow Access from Anywhere) so Railway can connect.

---

## Need Help?
Check the **Deployments** tab in Railway for logs if the build fails. Most common issues are missing environment variables!
