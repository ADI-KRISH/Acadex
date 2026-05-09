const mongoose = require('mongoose');
const User = require('./models/User');
const ClassGroup = require('./models/ClassGroup');
const ChatRoom = require('./models/ChatRoom');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const firstNames = [
  'Aditi', 'Arjun', 'Anjali', 'Akash', 'Bhavna', 'Bharat', 'Chitra', 'Chetan',
  'Deepa', 'Dev', 'Esha', 'Eshan', 'Falguni', 'Farhan', 'Gauri', 'Gaurav',
  'Hina', 'Hardik', 'Isha', 'Ishaan', 'Jaya', 'Jatin', 'Kavya', 'Karan',
  'Lata', 'Lokesh', 'Meera', 'Manish', 'Neha', 'Nitin', 'Ojasvi', 'Omkar',
  'Pooja', 'Prateek', 'Riya', 'Rahul', 'Sana', 'Siddharth', 'Tanvi', 'Tushar'
];

const lastNames = [
  'Nair', 'Menon', 'Pillai', 'Iyer', 'Sharma', 'Verma', 'Gupta', 'Singh',
  'Patel', 'Reddy', 'Rao', 'Das', 'Bose', 'Chatterjee', 'Mukherjee', 'Joshi',
  'Kulkarni', 'Deshmukh', 'Patil', 'Shinde', 'Khan', 'Sheikh', 'Malhotra', 'Kapoor'
];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kerala-connect');
    console.log('Connected to DB');

    // Clear existing data
    await ClassGroup.deleteMany({});
    await ChatRoom.deleteMany({});
    await User.deleteMany({ role: { $ne: 'admin' } });
    console.log('Cleared existing ClassGroups, ChatRooms, and non-admin Users');

    const classNames = [
      'CSE - A', 'CSE - B', 'CSE - C',
      'RAI - A', 'AIE - A', 'AIE - B', 'CYS - A'
    ];

    // Use raw password, the User model middleware will handle hashing
    const rawPassword = 'Password123!';
    
    // Create Teachers first
    const teachers = [];
    const teacherSubjects = ['Mathematics', 'Data Structures', 'Operating Systems', 'Machine Learning', 'Cyber Security', 'Robotics', 'Artificial Intelligence'];
    
    for (let i = 0; i < 10; i++) {
        const firstName = getRandom(firstNames);
        const lastName = getRandom(lastNames);
        const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}`;
        const email = `${username}@keralaconnect.edu`;
        
        const teacher = new User({
            username,
            email,
            password: rawPassword,
            role: 'faculty',
            profile: { firstName, lastName },
            academic: { 
              class: 'Faculty',
              stream: 'Faculty' 
            }
        });
        await teacher.save();
        teachers.push(teacher);
    }
    console.log('Created 10 faculty members with proper names');

    for (const name of classNames) {
      const stream = name.split(' ')[0] + ' Engineering';
      
      const classGroup = new ClassGroup({
        name,
        stream,
        semester: 6,
        description: `Official class group for ${name}`,
        courses: ['Math', 'Programming', 'Soft Skills']
      });

      // Assign random teachers to this class group
      const randomTeachers = [];
      for (let j = 0; j < 3; j++) {
          randomTeachers.push(getRandom(teachers)._id);
      }
      classGroup.faculty = [...new Set(randomTeachers)];

      // Add students to each class
      for (let i = 1; i <= 5; i++) {
        const firstName = getRandom(firstNames);
        const lastName = getRandom(lastNames);
        const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}`;
        
        const user = new User({
          username: username,
          email: `${username}@student.keralaconnect.edu`,
          password: rawPassword,
          role: i === 1 ? 'cr' : 'student',
          profile: { firstName, lastName },
          academic: { class: name, stream: stream }
        });
        await user.save();
        
        classGroup.members.push(user._id);
        
        if (i === 1) {
          classGroup.classRepresentative = user._id;
        }
      }

      await classGroup.save();
      console.log(`Created Class ${name} with 5 students (1 CR) and faculty assigned`);
    }

    console.log('Database successfully re-seeded with realistic names!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
