const mongoose = require('mongoose');
const ChatRoom = require('./models/ChatRoom');
const Message = require('./models/Message');
const User = require('./models/User');
const Reminder = require('./models/Reminder');
const Notification = require('./models/Notification');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

async function seedMassDummy() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB...");

    const users = await User.find({ role: { $ne: 'admin' } });
    const rooms = await ChatRoom.find();
    
    // 1. Add 40 more Chat Messages
    const chatContents = [
      "I love the new UI design!", "Is there a lab session today?", "Does anyone have the notes for Unit 2?",
      "Vite is so much faster than Webpack.", "React hooks are amazing.", "Don't forget the submission at midnight.",
      "Can we discuss the project after class?", "The cafeteria special is great today.", "Did you guys see the new notice?",
      "I'm stuck on the database connection.", "Has anyone tried the new library?", "Happy Weekend everyone!",
      "I'll be late for the session.", "Is the attendance mandatory?", "Who's the CR for BDA?",
      "Good morning!", "Let's study together at the library.", "The project deadline was extended!",
      "I found a great tutorial for Node.js.", "Does anyone have a spare pen?", "Thanks for the help!"
    ];

    const messages = [];
    for (let i = 0; i < 40; i++) {
      const room = rooms[Math.floor(Math.random() * rooms.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      const content = chatContents[Math.floor(Math.random() * chatContents.length)];
      messages.push({
        chatRoom: room._id,
        sender: user._id,
        content: content + " (ID: " + (i+1) + ")",
        createdAt: new Date(Date.now() - Math.random() * 86400000 * 3) // Last 3 days
      });
    }
    await Message.insertMany(messages);
    console.log("Added 40 chat messages.");

    // 2. Add 10 Reminders
    const reminderContents = [
      "Submit Assignment 1", "EOC Midterm Prep", "Project Meeting", "Quiz 3 - Math",
      "Return library books", "Buy new notebook", "Attend seminar on AI", "Call parents",
      "Update Resume", "Finish React tutorial"
    ];
    const reminderTypes = ['assignment', 'exam', 'event', 'general'];
    const reminders = [];
    for (let i = 0; i < 10; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      reminders.push({
        createdBy: user._id,
        title: reminderContents[i],
        description: "Automated dummy reminder for testing.",
        dueDate: new Date(Date.now() + Math.random() * 86400000 * 7), // Next 7 days
        class: user.academic?.class || 'CSE-AI A',
        stream: user.academic?.stream || 'Computer Science',
        type: reminderTypes[Math.floor(Math.random() * reminderTypes.length)],
        priority: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'medium' : 'low',
        isActive: true
      });
    }
    await Reminder.insertMany(reminders);
    console.log("Added 10 reminders.");

    // 3. Add 10 Notifications
    const notifTypes = ['answer', 'vote', 'mention', 'deadline', 'announcement'];
    const notifs = [];
    for (let i = 0; i < 10; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      notifs.push({
        recipient: user._id,
        sender: users[Math.floor(Math.random() * users.length)]._id,
        type: notifTypes[Math.floor(Math.random() * notifTypes.length)],
        title: "Dummy Notification " + (i+1),
        message: "This is a dummy notification for testing purposes.",
        isRead: false
      });
    }
    await Notification.insertMany(notifs);
    console.log("Added 10 notifications.");

    await mongoose.disconnect();
    console.log("Done!");
  } catch (err) {
    console.error(err);
  }
}

seedMassDummy();
