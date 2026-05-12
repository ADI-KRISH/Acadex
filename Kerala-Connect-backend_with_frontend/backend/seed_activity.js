const mongoose = require('mongoose');
const User = require('./models/User');
const ClassGroup = require('./models/ClassGroup');
const ChatRoom = require('./models/ChatRoom');
const Message = require('./models/Message');
const Post = require('./models/Post');
const Comment = require('./models/Comment');
const Reminder = require('./models/Reminder');
const Notification = require('./models/Notification');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const chatDialogues = [
  "Hey anyone started the assignment yet?",
  "I'm stuck on the second question. How do we approach the logic?",
  "Check the lecture notes from Tuesday, there's a similar example there.",
  "Thanks! Also, does anyone know if the lab is at 2 PM or 3 PM?",
  "It's at 2:30 PM today, Professor mentioned it on Slack.",
  "Got it, thanks!",
  "Are we having a group study session this weekend?",
  "I'm down for Sunday morning.",
  "Same here, let's meet at the library."
];

const forumQAs = [
  { 
    q: "Best resources for learning Deep Learning?", 
    a: "I highly recommend the fast.ai course and the Deep Learning book by Ian Goodfellow. Both are excellent for beginners and intermediate learners."
  },
  { 
    q: "How to handle null pointers in Java?", 
    a: "Always use Optional or check for null before accessing methods. Also, consider using @NonNull annotations if you're using a framework like Spring."
  },
  { 
    q: "What's the difference between SQL and NoSQL?", 
    a: "SQL is relational and structured (tables), while NoSQL is non-relational and more flexible (documents, key-value, etc.). Use SQL for consistency and NoSQL for scalability."
  }
];

async function seedActivity() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kerala-connect');
    console.log('Connected to DB for activity seeding');

    // 1. Get all ClassGroups
    const classes = await ClassGroup.find().populate('members').populate('classRepresentative');
    
    for (const cg of classes) {
      console.log(`\n--- Seeding activity for ${cg.name} ---`);
      const members = cg.members;
      const cr = cg.classRepresentative;
      if (!members.length || !cr) continue;

      // 2. Chat Activity
      const rooms = await ChatRoom.find({ classGroup: cg._id });
      for (const room of rooms) {
        console.log(`  Seeding chat for room: ${room.name}`);
        for (let i = 0; i < 5; i++) {
          const sender = members[Math.floor(Math.random() * members.length)];
          const content = chatDialogues[Math.floor(Math.random() * chatDialogues.length)];
          const msg = new Message({
            chatRoom: room._id,
            sender: sender._id,
            content: content,
            createdAt: new Date(Date.now() - (5 - i) * 1000 * 60 * 10)
          });
          await msg.save();
        }
      }

      // 3. Forum Activity (Class specific)
      for (let i = 0; i < 2; i++) {
        const qa = forumQAs[Math.floor(Math.random() * forumQAs.length)];
        const author = members[Math.floor(Math.random() * members.length)];
        
        const post = new Post({
          title: `[${cg.name}] ${qa.q}`,
          content: `I'm really confused about this topic in ${cg.name}. Can someone help?`,
          author: author._id,
          class: cg.name,
          stream: cg.stream,
          status: 'active',
          category: 'question'
        });
        await post.save();

        const respondent = members.find(m => m._id.toString() !== author._id.toString()) || members[0];
        const comment = new Comment({
          content: qa.a,
          author: respondent._id,
          post: post._id
        });
        await comment.save();
        post.commentsCount = 1;
        await post.save();
      }

      // 4. Reminders Activity
      const reminder = new Reminder({
        title: `URGENT: ${cg.name} Lab Submission`,
        description: `Please upload your lab reports to the portal before 11:59 PM today. Late submissions won't be accepted.`,
        dueDate: new Date(Date.now() + 86400000), // tomorrow
        class: cg.name,
        stream: cg.stream,
        createdBy: cr._id,
        priority: 'high'
      });
      await reminder.save();

      // 5. Notifications Activity
      for (const student of members) {
        if (student.role === 'student') {
          const notif = new Notification({
            recipient: student._id,
            sender: cr._id,
            type: 'announcement',
            title: `New Reminder in ${cg.name}`,
            message: `CR ${cr.profile.firstName} posted a new deadline.`,
            isRead: false
          });
          await notif.save();
        }
      }
    }

    console.log('\n--- ACTIVITY SEEDING COMPLETE ---');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedActivity();
