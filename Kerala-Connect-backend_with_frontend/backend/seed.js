const mongoose = require('mongoose');
const User = require('./models/User');
const ClassGroup = require('./models/ClassGroup');
const ChatRoom = require('./models/ChatRoom');
const Post = require('./models/Post');
const Reminder = require('./models/Reminder');
const Notification = require('./models/Notification');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const firstNames = ['Aditi', 'Arjun', 'Anjali', 'Akash', 'Bhavna', 'Bharat', 'Chitra', 'Chetan', 'Deepa', 'Dev', 'Esha', 'Eshan', 'Falguni', 'Farhan', 'Gauri', 'Gaurav', 'Hina', 'Hardik', 'Isha', 'Ishaan', 'Jaya', 'Jatin', 'Kavya', 'Karan', 'Lata', 'Lokesh', 'Meera', 'Manish', 'Neha', 'Nitin', 'Ojasvi', 'Omkar', 'Pooja', 'Prateek', 'Riya', 'Rahul', 'Sana', 'Siddharth', 'Tanvi', 'Tushar'];
const lastNames = ['Nair', 'Menon', 'Pillai', 'Iyer', 'Sharma', 'Verma', 'Gupta', 'Singh', 'Patel', 'Reddy', 'Rao', 'Das', 'Bose', 'Chatterjee', 'Mukherjee', 'Joshi', 'Kulkarni', 'Deshmukh', 'Patil', 'Shinde', 'Khan', 'Sheikh', 'Malhotra', 'Kapoor'];

const STREAMS = [
  { name: 'AIE', fullName: 'Artificial Intelligence', classes: ['AIE-A', 'AIE-B'], subjects: ['Machine Learning', 'Neural Networks', 'Python for AI', 'Linear Algebra'] },
  { name: 'RAI', fullName: 'Robotics & Automation', classes: ['RAI-A'], subjects: ['Control Systems', 'Embedded C', 'Robot Kinematics', 'Sensor Tech'] },
  { name: 'CSE', fullName: 'Computer Science', classes: ['CSE-A', 'CSE-B', 'CSE-C'], subjects: ['Data Structures', 'Operating Systems', 'Web Tech', 'Database Management'] },
  { name: 'CYS', fullName: 'Cyber Security', classes: ['CYS-A'], subjects: ['Cryptography', 'Network Security', 'Ethical Hacking', 'Digital Forensics'] }
];

function getRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kerala-connect');
    console.log('Connected to DB');

    // Clear all collections to ensure a fresh start
    await User.deleteMany({ role: { $ne: 'admin' } });
    await ClassGroup.deleteMany({});
    await ChatRoom.deleteMany({});
    await Post.deleteMany({});
    await Reminder.deleteMany({});
    await Notification.deleteMany({});
    console.log('Cleared existing data (except admin)');

    const rawPassword = 'Password123!';
    const teachers = [];

    // 1. Create Teachers
    for (let i = 0; i < 15; i++) {
      const fn = getRandom(firstNames);
      const ln = getRandom(lastNames);
      const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@keralaconnect.edu`;
      const t = new User({
        username: `${fn.toLowerCase()}${i}`,
        email,
        password: rawPassword,
        role: 'faculty',
        profile: { firstName: fn, lastName: ln },
        academic: { class: 'Faculty', stream: 'Faculty' }
      });
      await t.save();
      teachers.push(t);
    }
    console.log('Created 15 faculty members');

    // 2. Process Streams and Classes
    for (const stream of STREAMS) {
      console.log(`\n--- Seeding Stream: ${stream.name} ---`);

      for (const className of stream.classes) {
        // Create Class Group
        const cg = new ClassGroup({
          name: className,
          stream: stream.fullName,
          semester: 4,
          description: `Official group for ${className}`,
          faculty: [getRandom(teachers)._id, getRandom(teachers)._id]
        });
        await cg.save();

        // Create Students and CR
        let crUser = null;
        for (let i = 0; i < 8; i++) {
          const fn = getRandom(firstNames);
          const ln = getRandom(lastNames);
          const role = i === 0 ? 'cr' : 'student';
          const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${Math.floor(Math.random()*1000)}@student.keralaconnect.edu`;
          
          const user = new User({
            username: `${fn.toLowerCase()}${Math.floor(Math.random()*1000)}`,
            email,
            password: rawPassword,
            role,
            profile: { firstName: fn, lastName: ln },
            academic: { class: className, stream: stream.fullName },
            classGroup: cg._id
          });
          await user.save();
          cg.members.push(user._id);
          if (role === 'cr') {
            cg.classRepresentative = user._id;
            crUser = user;
          }
        }
        await cg.save();

        // Create Chat Rooms for each subject in this class
        for (const subject of stream.subjects) {
          const room = new ChatRoom({
            name: subject,
            classGroup: cg._id,
            creator: cg.classRepresentative,
            status: 'active'
          });
          await room.save();
        }

        // Create Reminders for this class
        for (let i = 1; i <= 3; i++) {
          const reminder = new Reminder({
            title: `${stream.name} Assignment ${i}`,
            description: `Submit by Friday. Important for internal marks.`,
            dueDate: new Date(Date.now() + i * 86400000 * 3),
            class: className,
            stream: stream.fullName,
            createdBy: cg.classRepresentative,
            priority: i === 1 ? 'high' : 'medium'
          });
          await reminder.save();
        }
        
        console.log(`Created Class ${className} with 8 students, CR, ${stream.subjects.length} chat rooms and 3 reminders.`);
      }

      // 3. Create Shared Forum Posts for this Stream
      // AIE-A and AIE-B will see these if we filter by stream name
      for (let i = 1; i <= 5; i++) {
        const post = new Post({
          title: `[${stream.name}] Help with ${getRandom(stream.subjects)}`,
          content: `Hi everyone, I'm struggling with the latest topic in ${getRandom(stream.subjects)}. Can someone explain the core concepts? I've checked the textbooks but it's still unclear.`,
          author: getRandom(teachers)._id,
          class: stream.name, // Using stream name as shared class identifier
          stream: stream.fullName,
          tags: [stream.name.toLowerCase(), 'doubt', 'help'],
          category: 'question'
        });
        await post.save();
      }
    }

    console.log('\n--- SEEDING COMPLETE ---');
    console.log('System is now populated with students, CRs, subjects, and shared stream content.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
