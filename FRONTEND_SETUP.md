# Kerala Connect Frontend Setup Guide

A complete React frontend for the Kerala Connect Academic Discussion Platform, built with modern technologies and best practices.

## 🚀 Features Implemented

### ✅ Core Functionality
- **User Authentication**: Login, Register, Logout with JWT tokens
- **Dashboard**: Personalized dashboard with stats and recent posts
- **Post Management**: Create, view, search, and filter posts
- **Real-time Notifications**: Notification system with unread counts
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Role-based UI**: Different interfaces for students, CRs, faculty, and admins

### 🎨 UI/UX Features
- Modern, clean interface with Tailwind CSS
- Loading states and error handling
- Toast notifications for user feedback
- Form validation with react-hook-form
- Smooth transitions and animations
- Accessibility-focused design

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (running backend server)
- Git

## 🛠️ Installation & Setup

### 1. Clone and Switch to Branch
```bash
git clone https://github.com/ADI-KRISH/Kerala-Connect.git
cd Kerala-Connect
git checkout backend_with_frontend
```

### 2. Backend Setup (Required)
```bash
# Navigate to root (backend files are here)
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend
npm install
```

### 4. Environment Configuration
Create a `.env` file in the `frontend` directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 5. Start the Application
```bash
# Terminal 1: Start backend (from root directory)
npm run dev

# Terminal 2: Start frontend (from frontend directory)
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📁 Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── Login.js
│   │   │   └── Register.js
│   │   ├── dashboard/
│   │   │   └── Dashboard.js
│   │   ├── posts/
│   │   │   └── CreatePost.js
│   │   └── common/
│   │       └── ProtectedRoute.js
│   ├── contexts/
│   │   └── AuthContext.js
│   ├── services/
│   │   └── api.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:5000/api` |

### Tailwind CSS Configuration

The project uses Tailwind CSS with a custom color scheme and component classes. Configuration is in `tailwind.config.js`.

## 🧪 Testing the Application

### 1. Create Test Accounts

**Student Account:**
- Email: `student@test.com`
- Password: `Password123`
- Role: Student
- Class: CS-A
- Stream: Computer Science

**CR Account:**
- Email: `cr@test.com`
- Password: `Password123`
- Role: Class Representative
- Class: CS-A
- Stream: Computer Science

### 2. Test Workflow

1. **Registration**: Create a new account
2. **Login**: Test authentication flow
3. **Dashboard**: View personalized dashboard
4. **Create Post**: Test post creation with different categories
5. **Search**: Test search functionality
6. **Notifications**: Test notification system

## 🎯 User Flows

### Student Flow
1. Register/Login → Dashboard → View Posts → Create Post → Interact

### Class Representative Flow
1. Login → Dashboard → Create Announcements → Moderate Content

### Faculty Flow
1. Login → Dashboard → Monitor Discussions → Post Answers

## 🔐 Authentication Flow

1. **Login**: User submits credentials → API validates → JWT token returned
2. **Token Storage**: Token stored in localStorage
3. **API Calls**: Token included in Authorization header
4. **Auto-logout**: Token expiration redirects to login

## 📊 API Integration

The frontend integrates with the following API endpoints:

### Auth Endpoints
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/me` - Get current user
- `POST /auth/logout` - User logout

### Posts Endpoints
- `GET /posts` - Get posts with pagination
- `POST /posts` - Create new post
- `GET /posts/search` - Search posts
- `POST /posts/:id/vote` - Vote on post

### Notifications Endpoints
- `GET /notifications` - Get user notifications
- `GET /notifications/unread-count` - Get unread count
- `PUT /notifications/:id/read` - Mark as read

## 🎨 Styling Guidelines

### Color Scheme
- **Primary**: Blue (#3b82f6)
- **Secondary**: Gray (#64748b)
- **Success**: Green (#22c55e)
- **Warning**: Yellow (#f59e0b)
- **Error**: Red (#ef4444)

### Component Classes
- `.btn-primary` - Primary action buttons
- `.btn-secondary` - Secondary buttons
- `.input` - Form inputs
- `.card` - Card containers
- `.badge-*` - Status badges

## 🚀 Deployment

### Build for Production
```bash
cd frontend
npm run build
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel --prod
```

### Environment Variables for Production
```env
REACT_APP_API_URL=https://your-backend-api.com/api
```

## 🔧 Development Tips

### 1. Hot Reload
The development server supports hot reload for rapid development.

### 2. API Debugging
Use browser DevTools to inspect API requests and responses.

### 3. State Management
Currently using React Context for auth. Consider Redux/Zustand for larger apps.

### 4. Code Splitting
Implement lazy loading for better performance:
```javascript
const Dashboard = React.lazy(() => import('./components/dashboard/Dashboard'));
```

## 🐛 Common Issues & Solutions

### 1. CORS Error
Ensure backend CORS is configured for `http://localhost:3000`.

### 2. Authentication Issues
Check that JWT_SECRET is set in backend .env file.

### 3. API Connection
Verify backend is running on port 5000.

### 4. Build Errors
Clear node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🔄 Next Steps

### Planned Features
- Post detail views with comments
- User profiles
- Advanced search filters
- File upload functionality
- Real-time chat
- Mobile app (React Native)

### Performance Optimizations
- Code splitting
- Image optimization
- Caching strategies
- Service worker

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ for Kerala students**
