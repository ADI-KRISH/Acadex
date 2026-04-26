# Kerala Connect Backend API

A comprehensive RESTful API for the Kerala Connect Academic Discussion Platform, built with Node.js, Express, and MongoDB.

## 🚀 Features

- **User Authentication**: JWT-based secure authentication with role-based access control
- **Q&A Forum**: Create, read, update, delete posts and comments
- **Search & Filtering**: Advanced search with text indexing and filtering options
- **Voting System**: Upvote/downvote posts and comments
- **Notification System**: Real-time notifications for various user actions
- **Role Management**: Student, Class Representative, Faculty, and Admin roles
- **File Upload Support**: Attach files to posts and comments
- **Moderation**: Content moderation by CRs and admins
- **Rate Limiting**: API protection against abuse
- **Comprehensive Validation**: Input validation and sanitization

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ADI-KRISH/Kerala-Connect.git
   cd Kerala-Connect
   git checkout backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/kerala-connect
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the server**
   ```bash
   # Development mode with nodemon
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Routes

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "Password123",
  "profile": {
    "firstName": "John",
    "lastName": "Doe"
  },
  "academic": {
    "class": "CS-A",
    "stream": "Computer Science",
    "semester": 3
  }
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

#### Change Password
```http
PUT /auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "Password123",
  "newPassword": "NewPassword456"
}
```

### Post Routes

#### Get All Posts
```http
GET /posts?page=1&limit=10&class=CS-A&stream=Computer Science&category=question
```

#### Get Single Post
```http
GET /posts/:id
```

#### Create Post
```http
POST /posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "How to implement recursion in JavaScript?",
  "content": "I'm having trouble understanding recursion...",
  "class": "CS-A",
  "stream": "Computer Science",
  "category": "question",
  "tags": ["javascript", "recursion", "algorithms"]
}
```

#### Update Post
```http
PUT /posts/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated title",
  "content": "Updated content"
}
```

#### Delete Post
```http
DELETE /posts/:id
Authorization: Bearer <token>
```

#### Vote on Post
```http
POST /posts/:id/vote
Authorization: Bearer <token>
Content-Type: application/json

{
  "voteType": "upvote"
}
```

#### Mark Best Answer
```http
POST /posts/:id/best-answer
Authorization: Bearer <token>
Content-Type: application/json

{
  "commentId": "comment_id_here"
}
```

### Comment Routes

#### Get Comments for Post
```http
GET /comments/post/:postId?page=1&limit=20
```

#### Create Comment
```http
POST /comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Here's the solution to your problem...",
  "post": "post_id_here",
  "parent": "parent_comment_id_here" // optional, for replies
}
```

#### Update Comment
```http
PUT /comments/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Updated comment content"
}
```

#### Delete Comment
```http
DELETE /comments/:id
Authorization: Bearer <token>
```

#### Vote on Comment
```http
POST /comments/:id/vote
Authorization: Bearer <token>
Content-Type: application/json

{
  "voteType": "upvote"
}
```

### Notification Routes

#### Get User Notifications
```http
GET /notifications?page=1&limit=20&isRead=false
Authorization: Bearer <token>
```

#### Get Unread Count
```http
GET /notifications/unread-count
Authorization: Bearer <token>
```

#### Mark as Read
```http
PUT /notifications/:id/read
Authorization: Bearer <token>
```

#### Mark All as Read
```http
PUT /notifications/mark-all-read
Authorization: Bearer <token>
```

#### Send Deadline Notification (CR/Faculty/Admin)
```http
POST /notifications/send-deadline
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Assignment Deadline",
  "message": "Don't forget to submit your assignment",
  "className": "CS-A",
  "stream": "Computer Science",
  "deadline": "2024-01-15T23:59:59Z",
  "priority": "high"
}
```

### User Routes

#### Get All Users (Admin)
```http
GET /users?page=1&limit=10&role=student&class=CS-A
Authorization: Bearer <token>
```

#### Get User by ID
```http
GET /users/:id
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "bio": "Computer Science student"
  }
}
```

#### Get Users by Class
```http
GET /users/class/:className?stream=Computer Science
Authorization: Bearer <token>
```

#### Update User Role (Admin)
```http
PUT /users/:id/role
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "cr"
}
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

## 🎭 User Roles

- **student**: Can post questions, answer, vote
- **cr**: Student privileges + moderate class content, send announcements
- **faculty**: Monitor discussions, post answers/announcements
- **admin**: Full system access, user management

## 📊 Data Models

### User
```javascript
{
  username: String,
  email: String,
  password: String, // hashed
  role: String, // student, cr, faculty, admin
  profile: {
    firstName: String,
    lastName: String,
    avatar: String,
    bio: String
  },
  academic: {
    class: String,
    stream: String,
    semester: Number
  },
  stats: {
    questionsAsked: Number,
    answersGiven: Number,
    helpfulVotes: Number
  }
}
```

### Post
```javascript
{
  title: String,
  content: String,
  author: ObjectId, // ref: User
  class: String,
  stream: String,
  tags: [String],
  category: String, // question, announcement, discussion, assignment, exam
  votes: {
    upvotes: [{ user: ObjectId, createdAt: Date }],
    downvotes: [{ user: ObjectId, createdAt: Date }]
  },
  answerCount: Number,
  views: Number,
  isAnswered: Boolean,
  bestAnswer: ObjectId, // ref: Comment
  status: String // active, closed, deleted
}
```

### Comment
```javascript
{
  content: String,
  author: ObjectId, // ref: User
  post: ObjectId, // ref: Post
  parent: ObjectId, // ref: Comment (for replies)
  replies: [ObjectId], // ref: Comment
  votes: {
    upvotes: [{ user: ObjectId, createdAt: Date }],
    downvotes: [{ user: ObjectId, createdAt: Date }]
  },
  isBestAnswer: Boolean,
  helpfulVotes: Number,
  status: String // active, deleted
}
```

### Notification
```javascript
{
  recipient: ObjectId, // ref: User
  sender: ObjectId, // ref: User
  type: String, // answer, comment_reply, vote, mention, deadline, announcement
  title: String,
  message: String,
  relatedPost: ObjectId, // ref: Post
  relatedComment: ObjectId, // ref: Comment
  isRead: Boolean,
  readAt: Date
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/kerala-connect` |
| `JWT_SECRET` | JWT secret key | Required |
| `JWT_EXPIRE` | Token expiration time | `7d` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `EMAIL_HOST` | Email server host | `smtp.gmail.com` |
| `EMAIL_PORT` | Email server port | `587` |
| `EMAIL_USER` | Email username | - |
| `EMAIL_PASS` | Email password | - |

## 🚀 Deployment

### Using PM2
```bash
npm install -g pm2
pm2 start server.js --name kerala-connect-backend
pm2 startup
pm2 save
```

### Using Docker
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📝 Logging

The application uses console logging for development. In production, consider using a logging library like Winston or Morgan.

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT authentication
- Rate limiting (100 requests per 15 minutes)
- Input validation and sanitization
- CORS configuration
- Helmet.js for security headers
- MongoDB injection prevention

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue on GitHub.

---

**Built with ❤️ for Kerala students**
