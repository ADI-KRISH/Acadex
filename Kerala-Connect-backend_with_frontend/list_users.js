const mongoose = require('mongoose');
const User = require('./backend/models/User');

mongoose.connect('mongodb://localhost:27017/kerala-connect').then(async () => {
  const roles = ['student', 'cr'];
  const classes = ['AIE-A', 'AIE-B', 'RAI-A', 'CSE-A', 'CSE-B', 'CSE-C', 'CYS-A'];
  
  console.log('--- USER CREDENTIALS ---');
  for (const c of classes) {
    console.log(`\nClass: ${c}`);
    const cr = await User.findOne({ role: 'cr', 'academic.class': c });
    if (cr) console.log(`  CR: ${cr.email}`);
    
    const students = await User.find({ role: 'student', 'academic.class': c }).limit(2);
    students.forEach((s, i) => console.log(`  Student ${i+1}: ${s.email}`));
  }
  process.exit(0);
});
