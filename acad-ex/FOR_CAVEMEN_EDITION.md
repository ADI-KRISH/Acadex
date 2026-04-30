# AcadEx Frontend Architecture: The Caveman Edition 🪨

Welcome backend team! If you are used to plain HTML/CSS/JS or just haven't used React much, modern frontend frameworks can look like alien technology. 

This document explains what all these folders actually do using simple analogies.

---

## 1. `node_modules/` (The Hardware Store)
This folder is huge and messy. **Never touch it.**
* **What it is:** A local hardware store full of pre-written, reusable code (packages) made by other developers. 
* **How it works:** We use `package.json` as our shopping list. When you run `npm install`, the computer reads the list, goes to the internet, and downloads tools like React (for building UI), React Router (for navigating pages), and Axios (for talking to your backend).
* **Why we ignore it:** It contains thousands of files we don't need to look at. We use `.gitignore` so it never gets uploaded to GitHub.

## 2. `src/` & JSX (The Construction Zone)
`src` stands for **Source**. This is where 99% of our custom code lives.
* **JSX:** Notice how files end in `.jsx`? That stands for JavaScript XML. It allows us to write HTML *directly inside* our JavaScript files. Because modern web apps tie logic and structure together, JSX lets us fetch data and display it in the exact same file.

## 3. Components vs. Pages (Lego Bricks)
React abandons the old way of copying and pasting the same HTML (like a sidebar) onto 10 different pages. Instead, we use **Components**.
* **Components (`src/components/`):** A component is just a JavaScript function that returns some HTML. We build a sidebar once in `Sidebar.jsx`, and then anywhere we want a sidebar, we just type `<Sidebar />` like a custom HTML tag. These are our reusable Lego bricks.
* **Pages (`src/pages/`):** These are the large bases where we assemble the Lego bricks. `ForumPage.jsx` is just a container that imports `<Topbar />`, `<Sidebar />`, and a bunch of `<QuestionCard />` components.

## 4. `src/services/` (The Middleman)
This is the folder the backend team cares about most. It is the middleman between the React frontend and your Node.js backend.
* **`api.js`:** Instead of putting messy HTTP requests inside button clicks, all API calls (like `apiLogin`, `apiGetQuestions`) live here. 
* **Mock Mode:** Right now, it looks at the `.env` file. If there is no backend URL, it automatically intercepts requests and returns fake data from `mockData.js`. Once you finish the backend, just add `VITE_API_URL=http://localhost:5000/api` to the `.env` file, and `api.js` will automatically start sending real HTTP requests to your server using Axios.

## 5. `src/context/` (The Radio Towers)
Context solves a major problem: passing data down through 10 layers of components (Prop Drilling).
* **What it is:** Think of Context as a Radio Tower at the very top of the app.
* **`AuthContext.jsx`:** This tower holds the user's login state and JWT token. If a tiny component deep inside a chat box needs to know the user's name, it just "tunes in" to the AuthContext radio tower instead of having the data passed down manually layer by layer. 
* **`ThemeContext.jsx`:** Another tower that broadcasts dark mode/light mode settings.

## 6. Vite & `dist/` (The Funnel)
If we use all these massive tools, won't the website be slow? No, because of Vite.
* **The Funnel:** When you run `npm run build`, Vite acts as a filter. It reads through our `src/` code, grabs *only the specific parts* of `node_modules` that we actually used, throws away the rest, and squishes it all down.
* **`dist/`:** It spits out the final, highly compressed HTML, CSS, and JS files into a folder called `dist` (Distribution). This tiny `dist` folder is the only thing that actually gets deployed to the live website!
