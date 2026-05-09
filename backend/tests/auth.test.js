const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = express();

// Mock the environment
process.env.JWT_SECRET = 'test-secret';

// Import models and routes
const User = require('../models/User');
const authRoutes = require('../routes/auth');

app.use(express.json());
app.use('/api/auth', authRoutes);

let mongoServer;

beforeAll(async () => {
  // Disconnect any existing connections
  await mongoose.disconnect();
  // We use memory server to avoid touching the real database
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  } catch (error) {
    // Fallback to local test DB if memory server isn't installed
    await mongoose.connect('mongodb://127.0.0.1:27017/kerala-connect-test');
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongoServer) await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Auth API Modules', () => {
  const testUser = {
    username: 'testuser1',
    email: 'test@example.com',
    password: 'Password123!',
    role: 'student',
    profile: {
      firstName: 'Test',
      lastName: 'User'
    },
    academic: {
      class: 'CS',
      stream: 'BTech',
      semester: 6
    }
  };

  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBeTruthy();
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(testUser.email);
  });

  it('should not register user with duplicate email', async () => {
    // First registration
    await request(app).post('/api/auth/register').send(testUser);
    
    // Duplicate registration
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBeFalsy();
    expect(res.body.message).toMatch(/already exists/);
  });

  it('should login successfully with correct credentials', async () => {
    // Create user
    await request(app).post('/api/auth/register').send(testUser);

    // Login
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.token).toBeDefined();
  });

  it('should fail login with wrong password', async () => {
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'wrongpassword'
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBeFalsy();
  });
});
