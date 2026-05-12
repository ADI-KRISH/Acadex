# Deployment Guide

To make your AcadEx platform accessible online, you need to deploy the **Backend** (Node.js/Express) and the **Frontend** (React/Vite).

## 1. Backend Deployment (Render)

Render is great for Node.js apps.

1.  **Connect GitHub:** Create a Render account and connect your GitHub repository.
2.  **New Web Service:** Select "New" -> "Web Service".
3.  **Configure:**
    *   **Name:** `acadex-backend`
    *   **Runtime:** `Node`
    *   **Build Command:** `cd backend && npm install`
    *   **Start Command:** `cd backend && node server.js`
4.  **Environment Variables:** Add the variables from your `backend/.env` file:
    *   `MONGODB_URI`: Your MongoDB Atlas connection string.
    *   `JWT_SECRET`: A long random string.
    *   `FRONTEND_URL`: The URL of your deployed frontend (e.g., `https://acadex.netlify.app`).
5.  **Deploy:** Click "Create Web Service".

## 2. Frontend Deployment (Netlify)

Netlify is perfect for Vite apps.

1.  **Connect GitHub:** Create a Netlify account and connect your repository.
2.  **New Site:** Select "Import from git".
3.  **Configure:**
    *   **Base directory:** `acad-ex`
    *   **Build command:** `npm run build`
    *   **Publish directory:** `dist`
4.  **Environment Variables:**
    *   `VITE_API_URL`: The URL of your deployed backend (e.g., `https://acadex-backend.onrender.com/api`).
5.  **Deploy:** Click "Deploy site".

## 3. Post-Deployment Steps

*   **Update URLs:** Make sure the `FRONTEND_URL` on Render points to your Netlify site, and `VITE_API_URL` on Netlify points to your Render API.
*   **MongoDB Whitelist:** On MongoDB Atlas, go to "Network Access" and allow access from anywhere (`0.0.0.0/0`) or find the specific IP addresses of your Render instance.
