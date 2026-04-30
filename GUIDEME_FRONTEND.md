# 🎨 Frontend Guide — AcadEx (Ihsal Riyas)

> This is your personal guide for the frontend part of the AcadEx project.
> Your teammates (Aditya & Dhruv) handle the backend (Node.js + Express + MongoDB).
> Your job: build the **React.js web frontend** that talks to their API.

---

## ✅ What's Already Done — Prototype (`AcadEx_Prototype.html`)

Your HTML prototype is solid. Here's what you've already built:

### Pages / Views
| Page | Status | Notes |
|------|--------|-------|
| **Forum** | ✅ Done | Question cards, tabs (All/Unanswered/My Posts), tag filters, class filters |
| **Forum Thread View** | ✅ Done | Full thread with accepted answer, reply box, vote buttons |
| **Group Chat** | ✅ Done | Live message UI, send message, timestamps |
| **Reminders** | ✅ Done | Card list with urgency styling (red/amber/normal) |
| **Appearance Settings** | ✅ Done | Theme toggle, accent colour, font size/family, chat bg & bubble colour |
| **Login / Signup** | ❌ Missing | Not in prototype at all |
| **Notifications** | ❌ Missing | No notification panel or page |
| **Profile Page** | ❌ Missing | No user profile view |
| **CR Admin Panel** | ❌ Missing | No moderation UI |

### Features / Components
| Feature | Status | Notes |
|---------|--------|-------|
| Dark/light theme toggle | ✅ Done | Works with CSS vars |
| Accent colour picker | ✅ Done | Updates CSS custom property live |
| Search bar (filter questions) | ✅ Done | JS filter on question list |
| Tab switching | ✅ Done | All / Unanswered / My Posts |
| Tag filter chips | ✅ Done | CV, SE, WSN, Python, Exam Help |
| Class/stream filter (sidebar) | ✅ Done | Filters questions by class |
| Ask Question modal | ✅ Done | Form with title, body, class, tags |
| Add Reminder modal | ✅ Done | Title, date, class, priority |
| Chat customise modal | ✅ Done | Name, bg colour, bubble colour, font |
| Send chat message | ✅ Done | Appends to local state & re-renders |
| Vote buttons | ✅ Done | UI only — no backend yet |
| Pinned questions | ✅ Done | Amber left-border on pinned card |
| Announcement bar | ✅ Done | Purple info strip at top of forum |
| Right panel (upcoming + activity) | ✅ Done | Static data |
| Responsive (hide right panel) | ✅ Done | `@media (max-width: 900px)` |
| **Real auth (login/JWT)** | ❌ Missing | All data is hardcoded JS arrays |
| **API calls to backend** | ❌ Missing | No fetch/axios, all local state |
| **Persistent data** | ❌ Missing | Refresh = data gone |
| **Vote upvote logic** | ❌ Missing | Button exists but no state update |
| **Mark answer accepted** | ❌ Missing | No interaction |
| **Multiple chat rooms** | ❌ Missing | Only one hardcoded group |

---

## 🚧 What's Still Needed (Your TODO List)

### 🔴 High Priority (Core Requirements)

- [ ] **Login / Signup Page**
  - Email + password form
  - JWT token stored in `localStorage` after login
  - Redirect to forum on success

- [ ] **Connect Forum to Backend API**
  - `GET /api/questions` → replace hardcoded `questions` array
  - `POST /api/questions` → on submit from "Ask Question" modal
  - `GET /api/questions/:id` → load thread view

- [ ] **Connect Answers to Backend API**
  - `POST /api/questions/:id/answers` → on "Post Answer" click
  - `PATCH /api/answers/:id/accept` → for accepted answer (CR/author)

- [ ] **Connect Reminders to Backend API**
  - `GET /api/reminders` → replace hardcoded reminders
  - `POST /api/reminders` → CR-only, from Add Reminder modal

- [ ] **Vote System (Functional)**
  - `POST /api/questions/:id/vote` and `POST /api/answers/:id/vote`
  - Update vote count in UI after response

- [ ] **Auth Guard**
  - If no JWT token in localStorage → redirect to `/login`
  - Send `Authorization: Bearer <token>` header on all API calls

### 🟡 Medium Priority

- [ ] **Profile / User Info Display**
  - Show logged-in user name, roll number, role in sidebar
  - Replace hardcoded "Raymics S. · AIE23034"

- [ ] **Multiple Chat Rooms** (one per class)
  - Sidebar class list should switch chat room
  - `GET /api/chats/:classId/messages`
  - `POST /api/chats/:classId/messages`

- [ ] **Notification Panel**
  - Bell icon in top bar
  - Dropdown showing new answers on your questions, new reminders

- [ ] **CR Admin Controls**
  - If user role is `cr`, show "Pin", "Delete", "Announce" buttons on posts
  - `PATCH /api/questions/:id/pin` → pin a question
  - Announcement bar text pulled from API

- [ ] **Real-time Chat** (WebSocket / Socket.io)
  - Currently chat only appends locally
  - Backend should broadcast messages via Socket.io

### 🟢 Nice to Have (Stretch Goals)

- [ ] **Mobile app** — React Native (Expo) — reuse same API
- [ ] **Dark/light preference saved** to `localStorage` so it persists on reload
- [ ] **Infinite scroll or pagination** on forum question list
- [ ] **Code block formatting** in answers (markdown or syntax highlight)
- [ ] **File/image attachments** in questions

---

## 🛠️ Step-by-Step: Migrating Prototype → React App

### Step 1: Scaffold the React App
```bash
cd c:\Users\ihsal\Desktop
mkdir acad-ex && cd acad-ex
npx create-react-app client
cd client
npm install axios react-router-dom
npm run start
```

### Step 2: Set Up Folder Structure
```
src/
├── components/
│   ├── Sidebar.jsx
│   ├── Topbar.jsx
│   ├── QuestionCard.jsx
│   ├── AnswerCard.jsx
│   ├── ReminderCard.jsx
│   ├── ChatMessage.jsx
│   └── Modal.jsx
├── pages/
│   ├── LoginPage.jsx
│   ├── ForumPage.jsx
│   ├── ThreadPage.jsx
│   ├── ChatPage.jsx
│   ├── RemindersPage.jsx
│   └── SettingsPage.jsx
├── services/
│   └── api.js           ← all axios calls go here
├── context/
│   └── AuthContext.jsx  ← JWT token, user info
├── App.jsx
└── index.css            ← copy your CSS vars from prototype
```

### Step 3: Copy CSS Variables
Copy all the `:root { ... }` and `[data-theme="light"]` rules from your prototype into `src/index.css`.

### Step 4: Build Components (use your prototype as reference)
Take the HTML from each section of your prototype and convert to `.jsx`.  
Example — `QuestionCard.jsx`:
```jsx
export default function QuestionCard({ question, onClick }) {
  return (
    <div className={`question-card ${question.pinned ? 'pinned' : ''}`} onClick={onClick}>
      {/* copy the q-header, q-title, q-excerpt, q-tags, q-footer divs */}
    </div>
  );
}
```

### Step 5: API Service Layer
Create `src/services/api.js`:
```js
import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const getQuestions = () => axios.get(`${BASE}/questions`, getHeaders());
export const postQuestion = (data) => axios.post(`${BASE}/questions`, data, getHeaders());
export const getThread = (id) => axios.get(`${BASE}/questions/${id}`, getHeaders());
export const postAnswer = (id, data) => axios.post(`${BASE}/questions/${id}/answers`, data, getHeaders());
export const getReminders = () => axios.get(`${BASE}/reminders`, getHeaders());
export const postReminder = (data) => axios.post(`${BASE}/reminders`, data, getHeaders());
export const login = (data) => axios.post(`${BASE}/auth/login`, data);
export const register = (data) => axios.post(`${BASE}/auth/register`, data);
```

### Step 6: Auth Context
```jsx
// src/context/AuthContext.jsx
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  const loginUser = (userData, jwt) => {
    setUser(userData); setToken(jwt);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', jwt);
  };

  const logout = () => {
    setUser(null); setToken(null);
    localStorage.clear();
  };

  return <AuthContext.Provider value={{ user, token, loginUser, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
```

### Step 7: Wire Up Routing (App.jsx)
```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import ForumPage from './pages/ForumPage';
// ... other pages

function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<PrivateRoute><ForumPage /></PrivateRoute>} />
        {/* etc. */}
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 🔌 API Endpoints to Expect from Backend

Ask Aditya/Dhruv to implement these (or confirm they match):

| Method | Endpoint | Auth? | Description |
|--------|----------|-------|-------------|
| POST | `/api/auth/register` | No | Register user |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/questions` | Yes | All questions (with filters) |
| POST | `/api/questions` | Yes | Create question |
| GET | `/api/questions/:id` | Yes | Single question + answers |
| POST | `/api/questions/:id/answers` | Yes | Post an answer |
| PATCH | `/api/questions/:id/pin` | CR only | Pin a question |
| POST | `/api/questions/:id/vote` | Yes | Upvote question |
| POST | `/api/answers/:id/vote` | Yes | Upvote answer |
| PATCH | `/api/answers/:id/accept` | Author/CR | Accept answer |
| GET | `/api/reminders` | Yes | Get reminders (filtered by class) |
| POST | `/api/reminders` | CR only | Create reminder |
| GET | `/api/users/me` | Yes | Get logged-in user info |

---

## 💡 Coordination with Backend Team

- Confirm the **base URL** they'll use for the API (probably `http://localhost:5000` locally)
- Ask them to set `Access-Control-Allow-Origin: *` or your specific origin in CORS config
- Agree on the **exact request/response shapes** (JSON field names) early
- Set up `.env` file in your React app:
  ```
  REACT_APP_API_URL=http://localhost:5000/api
  ```

---

## 📅 Suggested Timeline

| Week | Task |
|------|------|
| Week 1 | Scaffold React app, copy CSS, build Sidebar + Topbar components |
| Week 2 | Build ForumPage + QuestionCard (with hardcoded data first) |
| Week 3 | Build LoginPage, wire up AuthContext |
| Week 4 | Replace hardcoded data with API calls (once backend is ready) |
| Week 5 | Build ChatPage, RemindersPage |
| Week 6 | Polish: notifications, CR controls, vote logic |
| Week 7 | Testing + deployment to Vercel |

---

## 🗒️ Quick Reference — Prototype → React Mapping

| Prototype element | React equivalent |
|-------------------|-----------------|
| `showPage('forum')` | React Router `<Navigate to="/" />` |
| `renderQuestions()` | `useEffect` + `axios.get(...)` |
| `questions` JS array | State via `useState` / API response |
| `openModal('ask')` | `useState(false)` modal visibility |
| `submitQuestion()` | `axios.post(...)` inside handler |
| `toggleTheme()` | CSS class toggle + localStorage |
| `chatMessages` array | State + Socket.io listener |

---

> **Remember:** Your prototype is already an excellent reference. Every page and component you need to build in React has already been designed by you in HTML. Just componentise it! 🚀
