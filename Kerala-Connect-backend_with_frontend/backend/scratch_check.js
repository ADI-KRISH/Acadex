const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const ChatRoom = require('./models/ChatRoom');
    const Message = require('./models/Message');

    const rooms = await ChatRoom.find();
    console.log("Chat Rooms:");
    rooms.forEach(r => {
      console.log(`- ID: ${r._id}, Name: ${r.name}`);
    });
    
    const count = await User.countDocuments();
    console.log(`Total users in DB: ${count}`);
    
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
check();
