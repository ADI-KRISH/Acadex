# 🚀 Kerala Connect: Full Railway Deployment Guide

This guide will walk you through hosting **both** your Frontend and Backend on **Railway** within the same project.

---

## 1. Project Setup on [Railway](https://railway.app/)

1.  **Sign Up/Login** and connect your GitHub account.
2.  Click **+ New Project** > **Deploy from GitHub repo**.
3.  Select your repository: `Kerala-Connect`.
4.  Railway will create your first "Service". Let's configure this as the **Backend**.

---

## 2. Service 1: The Backend

1.  Click on the newly created service and go to **Settings**.
2.  **Service Name**: Change it to `backend`.
3.  **Root Directory**: Set this to `Kerala-Connect-backend_with_frontend/backend`.
4.  **Variables**: Add the following:
    *   `MONGODB_URI`: `mongodb+srv://Admin:CxaRzVxuKJPu0HgC@storage.xg8hzng.mongodb.net/kerala-connect?retryWrites=true&w=majority&appName=Storage`
    *   `JWT_SECRET`: (A random string)
    *   `PORT`: `5000`
    *   `NODE_ENV`: `production`
5.  **Public Networking**: Go to **Settings** > **Public Networking** > **Generate Domain**.
6.  **Copy the URL**: (e.g., `https://backend-production.up.railway.app`). You'll need this for the frontend.

---

## 3. Service 2: The Frontend

Now, let's add the frontend as a *second* service in the same project.

1.  In your Railway project dashboard, click **+ New** > **GitHub Repo**.
2.  Select the same repository: `Kerala-Connect`.
3.  Click on this second service and go to **Settings**.
4.  **Service Name**: Change it to `frontend`.
5.  **Root Directory**: Set this to `acad-ex`.
6.  **Variables**: Add:
    *   `VITE_API_URL`: `https://your-backend-url.up.railway.app/api` (Use the URL you copied from Service 1)
7.  **Public Networking**: Go to **Settings** > **Public Networking** > **Generate Domain**.
8.  This will give you your final live website URL! (e.g., `https://frontend-production.up.railway.app`).

---

## 4. Final Polish (CORS)

Go back to your **Backend Service** > **Variables** and add one more:
*   `FRONTEND_URL`: `https://your-frontend-url.up.railway.app` (Use the URL from Service 2)

---

## 💡 Why this works?
Railway is smart. By setting the **Root Directory**, you tell it which part of your project to build.
- For the `backend` folder, it finds the `Procfile` and `server.js`.
- For the `acad-ex` folder, it finds `package.json` and automatically builds your Vite app.

---

## Troubleshooting
- **Build Failures**: Check the **Deployments** tab logs. Usually, it's a missing environment variable.
- **API Errors**: Ensure your `VITE_API_URL` ends with `/api` and matches your backend domain exactly.
