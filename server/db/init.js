const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Result = require('../models/Result');
const Notice = require('../models/Notice');
const Fee = require('../models/Fee');
const Leave = require('../models/Leave');

const MONGO_URI = 'mongodb+srv://kmbirajdar1965_db_user:Dqaa1AzxfulgqVbJ@cluster0.wxosk0d.mongodb.net/cms?retryWrites=true&w=majority';

async function initDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    await seedDB();
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

async function seedDB() {
  const userCount = await User.countDocuments();
  if (userCount > 0) {
    console.log('Database already seeded.');
    return;
  }

  console.log('Seeding database with sample data...');

  const teacherHash = bcrypt.hashSync('teacher123', 10);
  const studentHash = bcrypt.hashSync('student123', 10);

  const teacher = await User.create({
    name: 'Dr. R.K. Sharma',
    email: 'teacher@college.com',
    password: teacherHash,
    role: 'teacher',
    phone: '9876543210'
  });

  const studentsData = [
    { name: 'Rahul Kumar', email: 'rahul@college.com', roll_no: 'CSE-001', class: 'CSE', section: 'A', phone: '9876543211' },
    { name: 'Priya Singh', email: 'priya@college.com', roll_no: 'CSE-002', class: 'CSE', section: 'A', phone: '9876543212' },
    { name: 'Amit Patel', email: 'amit@college.com', roll_no: 'CSE-003', class: 'CSE', section: 'A', phone: '9876543213' },
    { name: 'Sneha Gupta', email: 'sneha@college.com', roll_no: 'CSE-004', class: 'CSE', section: 'B', phone: '9876543214' },
    { name: 'Vikram Reddy', email: 'vikram@college.com', roll_no: 'CSE-005', class: 'CSE', section: 'B', phone: '9876543215' }
  ];

  const students = [];
  for (const s of studentsData) {
    s.password = studentHash;
    s.role = 'student';
    const student = await User.create(s);
    students.push(student);
  }

  for (const student of students) {
    for (let i = 1; i <= 10; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const status = Math.random() > 0.2 ? 'present' : 'absent';
      
      await Attendance.create({
        student_id: student._id,
        date: dateStr,
        status: status,
        marked_by: teacher._id
      });
    }
  }

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'English', 'Computer Science'];
  for (const student of students) {
    for (const subject of subjects) {
      const marks = Math.floor(Math.random() * 35) + 65;
      await Result.create({
        student_id: student._id,
        subject: subject,
        marks: marks,
        max_marks: 100,
        exam_type: 'Mid-Term',
        added_by: teacher._id
      });
    }
  }

  const notices = [
    { title: 'Mid-Term Examination Schedule', body: 'Mid-term examinations will commence from August 20, 2026. Students are advised to collect their hall tickets from the examination cell. The detailed timetable has been posted on the departmental notice board.', date: '2026-08-10T10:00:00Z' },
    { title: 'Library Hours Extended', body: 'The central library will remain open until 9:00 PM during the examination period starting August 18. Students are encouraged to utilise this facility for their preparation.', date: '2026-08-08T14:30:00Z' },
    { title: 'Annual Sports Day Registration', body: 'The annual sports day will be held on September 5, 2026. Interested students may register with their respective class representatives before August 25. Events include athletics, cricket, badminton, and chess.', date: '2026-08-05T09:00:00Z' },
    { title: 'Workshop on Web Development', body: 'A two-day workshop on modern web development will be conducted on August 22-23 in Lab 301. Registration is free for all CSE students. Limited seats available.', date: '2026-08-03T11:00:00Z' }
  ];

  for (const n of notices) {
    await Notice.create({
      title: n.title,
      body: n.body,
      posted_by: teacher._id,
      created_at: new Date(n.date)
    });
  }

  let index = 0;
  for (const student of students) {
    await Fee.create({ student_id: student._id, fee_type: 'Tuition Fee', amount: 45000, status: 'paid', due_date: '2026-07-15', paid_date: '2026-07-10' });
    await Fee.create({ student_id: student._id, fee_type: 'Laboratory Fee', amount: 8000, status: 'paid', due_date: '2026-07-15', paid_date: '2026-07-12' });
    await Fee.create({ 
      student_id: student._id, 
      fee_type: 'Library Fee', 
      amount: 3000, 
      status: index < 3 ? 'paid' : 'unpaid', 
      due_date: '2026-08-15', 
      paid_date: index < 3 ? '2026-08-01' : null 
    });
    await Fee.create({ student_id: student._id, fee_type: 'Examination Fee', amount: 5000, status: 'unpaid', due_date: '2026-09-01' });
    index++;
  }

  await Leave.create({ student_id: students[0]._id, from_date: '2026-08-15', to_date: '2026-08-16', reason: 'Family function — need to travel to hometown.', status: 'approved', created_at: new Date('2026-08-12T10:00:00Z') });
  await Leave.create({ student_id: students[1]._id, from_date: '2026-08-18', to_date: '2026-08-20', reason: 'Medical appointment at city hospital.', status: 'pending', created_at: new Date('2026-08-13T09:00:00Z') });
  await Leave.create({ student_id: students[2]._id, from_date: '2026-08-14', to_date: '2026-08-14', reason: 'Personal work.', status: 'rejected', created_at: new Date('2026-08-11T11:00:00Z') });

  console.log('Database seeded successfully.');
}

module.exports = { initDB };
