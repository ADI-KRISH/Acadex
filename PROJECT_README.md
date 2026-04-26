# Kerala Connect - Academic Discussion Platform

A comprehensive platform for university students and faculty to engage in academic discussions, share knowledge, and stay connected with class activities.

## 🎯 Project Overview

Kerala Connect solves the problem of scattered academic communication by providing a centralized platform for:
- Q&A discussions organized by class and stream
- Assignment and exam notifications
- Peer-to-peer knowledge sharing
- Content moderation by Class Representatives
- Real-time notifications and updates

## 🏗️ Project Structure

```
kerala-connect/
├── backend/                 # Node.js/Express API
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API endpoints
│   ├── middleware/         # Auth & validation
│   ├── utils/              # Helper functions
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API services
│   │   └── App.js          # Main app
│   └── package.json        # Frontend dependencies
├── package.json            # Root package.json
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ADI-KRISH/Kerala-Connect.git
   cd Kerala-Connect
   git checkout backend_with_frontend
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your MongoDB URI and JWT secret
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📋 Available Scripts

### Root Scripts
- `npm run install:all` - Install dependencies for all packages
- `npm run dev` - Start both backend and frontend in development mode
- `npm run dev:backend` - Start only backend server
- `npm run dev:frontend` - Start only frontend server
- `npm run build:frontend` - Build frontend for production

### Backend Scripts (run from backend/)
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run backend tests

### Frontend Scripts (run from frontend/)
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run frontend tests

## 🔧 Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Frontend
- **React 18** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling framework
- **Axios** - HTTP client
- **React Hook Form** - Form validation
- **React Hot Toast** - Notifications

## 🎨 Features

### User Roles
- **Student**: Post questions, answer, vote, receive notifications
- **Class Representative**: Student privileges + moderate content, send announcements
- **Faculty**: Monitor discussions, post answers/announcements
- **Admin**: Full system access, user management

### Core Features
- 🔐 Secure authentication with JWT
- 📝 Create and manage academic posts
- 💬 Threaded discussions and comments
- 🔍 Advanced search and filtering
- 📊 User statistics and leaderboards
- 🔔 Real-time notifications
- 📱 Responsive mobile design
- 🎯 Class and stream organization
- ⭐ Voting system for quality content
- 🏆 Best answer selection

## 📚 Documentation

- [Backend API Documentation](./backend/BACKEND_README.md)
- [Frontend Setup Guide](./FRONTEND_SETUP.md)
- [Software Requirements Specification](./backend/srs.txt)

## 🧪 Testing

### Test Accounts
You can create test accounts with these credentials:

**Student Account:**
- Email: `student@test.com`
- Password: `Password123`
- Role: Student
- Class: CS-A
- Stream: Computer Science

**Class Representative:**
- Email: `cr@test.com`
- Password: `Password123`
- Role: Class Representative
- Class: CS-A
- Stream: Computer Science

### Test Workflow
1. Register a new account
2. Login and explore the dashboard
3. Create a post with tags and categories
4. Test search and filtering
5. Check notification system
6. Test voting and best answer features

## 🚀 Deployment

### Backend Deployment
```bash
cd backend
npm install --production
npm start
```

### Frontend Deployment
```bash
cd frontend
npm run build
# Deploy the build/ folder to your hosting service
```

### Environment Variables
**Backend (.env):**
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/kerala-connect
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=https://your-domain.com
```

**Frontend (.env):**
```
REACT_APP_API_URL=https://your-backend-api.com/api
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Development Guidelines

### Code Style
- Use ES6+ features
- Follow consistent naming conventions
- Write clean, readable code
- Add comments for complex logic

### Git Workflow
- Use descriptive commit messages
- Create separate branches for features
- Test before committing
- Update documentation

## 🐛 Troubleshooting

### Common Issues

**CORS Error:**
- Ensure backend CORS is configured for your frontend URL
- Check that both servers are running on correct ports

**Authentication Issues:**
- Verify JWT_SECRET is set in backend .env
- Check that tokens are being stored correctly in localStorage

**Database Connection:**
- Ensure MongoDB is running
- Check MONGODB_URI in backend .env
- Verify database permissions

**Build Errors:**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **G S Aditya Krishna** - Full Stack Developer
- **Ihsal Riyas** - Backend Developer  
- **Dhruv Nair** - Frontend Developer

## 🙏 Acknowledgments

- Built for Kerala university students
- Inspired by the need for better academic communication
- Powered by modern web technologies

---

**Built with ❤️ for the Kerala student community**
