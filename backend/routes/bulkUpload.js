const express = require('express');
const router = express.Router();
const User = require('../models/User');
const ClassGroup = require('../models/ClassGroup');
const ChatRoom = require('../models/ChatRoom');
const { verifyToken, authorize } = require('../middleware/auth');
const csvUpload = require('../middleware/csvUpload');

// Apply admin protection to all routes
router.use(verifyToken);
router.use(authorize('admin'));

const parseCSV = (buffer) => {
  const content = buffer.toString('utf-8');
  const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    // Simple CSV parser (doesn't handle quotes containing commas)
    const values = line.split(',');
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ? values[index].trim() : '';
    });
    return row;
  });
};

// @route   POST /api/admin/bulk-upload/students
router.post('/students', csvUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const records = parseCSV(req.file.buffer);
    const results = { successful: 0, failed: 0, errors: [] };

    for (let [index, record] of records.entries()) {
      try {
        const { first_name, last_name, email, class_name, stream, password } = record;
        if (!first_name || !last_name || !email || !class_name || !stream || !password) {
          throw new Error('Missing required fields');
        }

        // Check if class exists, create if not
        let classGroup = await ClassGroup.findOne({ name: class_name });
        if (!classGroup) {
          classGroup = new ClassGroup({ name: class_name, stream: stream });
          await classGroup.save();
        }

        const username = `${first_name.toLowerCase()}.${last_name.toLowerCase()}.${Math.floor(Math.random() * 1000)}`;
        
        const user = new User({
          username,
          email,
          password,
          role: 'student',
          profile: { firstName: first_name, lastName: last_name },
          academic: { class: class_name, stream: stream }
        });
        await user.save();

        classGroup.addMember(user._id);

        results.successful++;
      } catch (err) {
        results.failed++;
        results.errors.push(`Row ${index + 2} (${record.email}): ${err.message}`);
      }
    }

    res.json({ success: true, message: 'Student bulk upload complete', data: results });
  } catch (error) {
    console.error('Student bulk upload error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/admin/bulk-upload/teachers
router.post('/teachers', csvUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const records = parseCSV(req.file.buffer);
    const results = { successful: 0, failed: 0, errors: [] };

    for (let [index, record] of records.entries()) {
      try {
        const { first_name, last_name, email, assignments, password } = record;
        if (!first_name || !last_name || !email || !assignments || !password) {
          throw new Error('Missing required fields');
        }

        const username = `prof.${first_name.toLowerCase()}.${last_name.toLowerCase()}`;
        
        // Find or create user
        let user = await User.findOne({ email });
        if (!user) {
          user = new User({
            username,
            email,
            password,
            role: 'faculty',
            profile: { firstName: first_name, lastName: last_name },
            academic: { class: 'Faculty', stream: 'N/A' } // Dummy values for faculty
          });
          await user.save();
        }

        // Parse assignments e.g., "CSE A:Math for Comp;ECE A:AI"
        const assignmentList = assignments.split(';').map(a => a.trim()).filter(a => a);
        for (let assignment of assignmentList) {
          const parts = assignment.split(':');
          if (parts.length === 2) {
            const className = parts[0].trim();
            const courseName = parts[1].trim();

            // Case-insensitive search for class group
            let classGroup = await ClassGroup.findOne({ name: { $regex: new RegExp(`^${className}$`, 'i') } });
            if (!classGroup) {
              classGroup = new ClassGroup({ name: className, stream: 'Unknown' });
            }
            
            // Check if teacher is already in faculty list using string comparison
            const alreadyInFaculty = classGroup.faculty.some(f => f.toString() === user._id.toString());
            if (!alreadyInFaculty) {
              classGroup.faculty.push(user._id);
            }
            
            // Clean up existing string courses if any
            classGroup.courses = classGroup.courses.map(c => typeof c === 'string' ? { name: c } : c);
            
            const courseIndex = classGroup.courses.findIndex(c => c.name.toLowerCase() === courseName.toLowerCase());
            if (courseIndex > -1) {
              classGroup.courses[courseIndex].teacher = user._id;
            } else {
              classGroup.courses.push({ name: courseName, teacher: user._id });
            }
            await classGroup.save();
          }
        }

        results.successful++;
      } catch (err) {
        results.failed++;
        results.errors.push(`Row ${index + 2} (${record.email}): ${err.message}`);
      }
    }

    res.json({ success: true, message: 'Teacher bulk upload complete', data: results });
  } catch (error) {
    console.error('Teacher bulk upload error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/admin/bulk-upload/subjects
router.post('/subjects', csvUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const records = parseCSV(req.file.buffer);
    const results = { successful: 0, failed: 0, errors: [] };

    for (let [index, record] of records.entries()) {
      try {
        const { course_name, class_name, teacher_name, teacher_email } = record;
        if (!course_name || !class_name) {
          throw new Error('Missing required fields (course_name, class_name)');
        }

        let teacherId = null;
        if (teacher_email) {
          let teacher = await User.findOne({ email: teacher_email.toLowerCase(), role: 'faculty' });
          
          // Fallback: search by name if email fails (very common in messy CSVs)
          if (!teacher && teacher_name) {
            const names = teacher_name.split(' ');
            const firstName = names[0];
            const lastName = names.slice(1).join(' ');
            teacher = await User.findOne({ 
              'profile.firstName': { $regex: new RegExp(`^${firstName}$`, 'i') },
              'profile.lastName': { $regex: new RegExp(`^${lastName}$`, 'i') },
              role: 'faculty'
            });
          }

          if (!teacher) {
            throw new Error(`Faculty not found with email "${teacher_email}" or name "${teacher_name}"`);
          }
          teacherId = teacher._id;
        }

        // Case-insensitive search for class group
        let classGroup = await ClassGroup.findOne({ name: { $regex: new RegExp(`^${class_name}$`, 'i') } });
        if (!classGroup) {
          classGroup = new ClassGroup({ 
            name: class_name, 
            stream: 'Unknown',
            createdBy: req.user._id
          });
        }
        
        const alreadyInFaculty = teacherId && classGroup.faculty.some(f => f.toString() === teacherId.toString());
        if (teacherId && !alreadyInFaculty) {
          classGroup.faculty.push(teacherId);
        }

        // Clean up existing string courses if any
        classGroup.courses = classGroup.courses.map(c => typeof c === 'string' ? { name: c } : c);

        const courseIndex = classGroup.courses.findIndex(c => c.name.toLowerCase() === course_name.toLowerCase());
        if (courseIndex > -1) {
          if (teacherId) classGroup.courses[courseIndex].teacher = teacherId;
        } else {
          classGroup.courses.push({ name: course_name, teacher: teacherId });
        }
        await classGroup.save();

        // Check if ChatRoom exists for this ClassGroup and course
        const existingRoom = await ChatRoom.findOne({ name: course_name, classGroup: classGroup._id });
        if (!existingRoom) {
          const newRoom = new ChatRoom({
            name: course_name,
            classGroup: classGroup._id,
            creator: req.user._id // The admin is the creator
          });
          await newRoom.save();
        }

        results.successful++;
      } catch (err) {
        results.failed++;
        results.errors.push(`Row ${index + 2} (${record.course_name}): ${err.message}`);
      }
    }

    res.json({ success: true, message: 'Subjects bulk upload complete', data: results });
  } catch (error) {
    console.error('Subjects bulk upload error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
