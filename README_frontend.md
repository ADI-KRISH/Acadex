# AcadEx — Academic Discussion & Doubt Resolution Platform

> **Course:** 22AIE311 – Software Engineering | **Batch:** AIE-A | **Group 20**

## 👥 Team Members

| Name | Roll Number | Role |
|------|-------------|------|
| GS Aditya Krishna | AM.SC.U4AIE23034 | Backend |
| Ihsal Riyas | AM.SC.U4AIE23037 | **Frontend** |
| Dhruv Nair | AM.SC.U4AIE23501 | Backend |

---

## 📌 What is AcadEx?

AcadEx is a centralised academic discussion and doubt-resolution platform inspired by Stack Overflow, designed specifically for institutional use at batch/department level.  
It replaces the chaos of WhatsApp groups and email threads with a structured, searchable, class-specific forum.

### Core Features
- 📝 **Forum** — Post and answer academic questions, organised by class/stream
- 💬 **Group Chat** — Real-time class group messaging
- 📌 **Reminders** — Assignment & test deadline alerts posted by Class Representatives (CRs)
- 🔐 **Role-based access** — Students, CRs (admin), Faculty

---

## 🏗️ Architecture

**Client–Server Architecture**

```
Browser / Mobile App  ──►  REST API (Node.js + Express)  ──►  MongoDB Atlas
                              │
                        JWT Authentication
```

| Layer | Technology |
|-------|-----------|
| Web Frontend | **React.js** |
| Mobile | **React Native (Expo)** |
| API Client | **Axios / Fetch API** |
| Backend Runtime | **Node.js** |
| Backend Framework | **Express.js** |
| Auth | **JWT + bcrypt** |
| Database | **MongoDB Atlas** (NoSQL) |
| Backend Hosting | **Render** (free tier) |
| Frontend Hosting | **Vercel / Netlify** |

---

## 📂 Project Structure (expected)

```
acad-ex/
├── client/                  # React.js web app (Ihsal's responsibility)
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Forum, Chat, Reminders, Settings, Login, etc.
│   │   ├── services/        # Axios API calls
│   │   ├── context/         # Auth context / global state
│   │   └── App.jsx
│   └── package.json
│
├── mobile/                  # React Native app (stretch goal)
│
├── server/                  # Node.js + Express backend (Aditya & Dhruv)
│   ├── routes/
│   ├── controllers/
│   ├── models/              # Mongoose schemas: User, Question, Answer, Reminder
│   ├── middleware/          # JWT auth middleware
│   └── index.js
│
├── AcadEx_Prototype.html    # Current HTML prototype (Ihsal)
└── README.md
```

---

## 🗃️ Data Models (MongoDB)

- **User** — id, name, rollNo, role (`student` | `cr` | `faculty`), classId
- **Question** — id, title, body, tags, classId, authorId, solved, votes, createdAt
- **Answer** — id, questionId, body, authorId, accepted, votes, createdAt
- **Reminder** — id, title, classId, dueDate, priority, createdBy (CR)

---

## 🔑 Use Cases

| UC | Name | Actor |
|----|------|-------|
| UC1 | Register User | Student |
| UC2 | Login | Student |
| UC3 | Post Question | Student |
| UC4 | Answer Question | Student |
| UC5 | View Forum Discussions | Student |
| UC6 | Manage/Moderate Posts | CR |
| UC7 | Post Assignment/Test Reminder | CR |
| UC8 | View Reminders | Student |

---

## 🚀 Running Locally

### Frontend (once React app is set up)
```bash
cd client
npm install
npm run dev
```

### Backend
```bash
cd server
npm install
npm run dev
```

> For now, open `AcadEx_Prototype.html` directly in your browser to preview the UI prototype.

---

## 📋 Development Phases

1. **Requirement Analysis** — ✅ Done (inception + elicitation phase submitted)
2. **System Design** — UML, DFD, Architecture diagrams
3. **Development** — Frontend + Backend + API integration
4. **Testing** — Unit & integration tests
5. **Deployment** — Render (backend) + Vercel (frontend)
