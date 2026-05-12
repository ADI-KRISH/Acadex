const mongoose = require('mongoose');
const ChatRoom = require('./models/ChatRoom');
const Message = require('./models/Message');
const User = require('./models/User');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

async function seedMessages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB...");

    const users = await User.find({ email: { $in: [
      'admin@test.com',
      'sophia.reddy41@student.keralaconnect.edu',
      'ishaan.brown37@student.keralaconnect.edu',
      'zara.jones52@keralaconnect.edu'
    ]}});

    const userMap = {};
    users.forEach(u => {
      if (u.email === 'admin@test.com') userMap.admin = u._id;
      if (u.email.includes('sophia')) userMap.cr = u._id;
      if (u.email.includes('ishaan')) userMap.student = u._id;
      if (u.email.includes('zara')) userMap.faculty = u._id;
    });

    const rooms = await ChatRoom.find();
    
    const messages = [];

    rooms.forEach(room => {
      if (room.name === 'Math') {
        messages.push(
          { chatRoom: room._id, sender: userMap.student, content: "Has anyone finished the assignment?" },
          { chatRoom: room._id, sender: userMap.cr, content: "The last problem is tricky." },
          { chatRoom: room._id, sender: userMap.faculty, content: "I've posted the hints for the last problem in the Forum." }
        );
      } else if (room.name === 'Programming') {
        messages.push(
          { chatRoom: room._id, sender: userMap.student, content: "What IDE are you guys using?" },
          { chatRoom: room._id, sender: userMap.admin, content: "I prefer VS Code for everything." },
          { chatRoom: room._id, sender: userMap.cr, content: "VS Code +1" }
        );
      } else if (room.name === 'EOC') {
        messages.push(
          { chatRoom: room._id, sender: userMap.cr, content: "The midterms are approaching!" },
          { chatRoom: room._id, sender: userMap.student, content: "I need a study partner for EOC." }
        );
      } else if (room.name.includes('Math for Comp')) {
        messages.push(
          { chatRoom: room._id, sender: userMap.student, content: "Discrete Math is killing me." },
          { chatRoom: room._id, sender: userMap.cr, content: "Anybody want to join a group session?" }
        );
      }
    });

    // Clear existing messages first if you want, but user asked to ADD more
    await Message.insertMany(messages);
    console.log(`Successfully added ${messages.length} dummy messages!`);

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

seedMessages();
