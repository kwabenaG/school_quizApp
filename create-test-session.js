#!/usr/bin/env node

const { v4: uuidv4 } = require('uuid');

console.log('🎓 Creating Test Session for School Quiz\n');

// Generate a proper UUID for the session
const sessionId = uuidv4();
const sessionName = 'Test Quiz Session';
const studentName = 'Test Student';

console.log('✅ Test Session Created!');
console.log('========================');
console.log(`Session ID: ${sessionId}`);
console.log(`Session Name: ${sessionName}`);
console.log(`Student Name: ${studentName}`);
console.log('');

console.log('🎮 How to Test:');
console.log('===============');
console.log('1. Make sure backend is running: cd apps/backend && npm run dev');
console.log('2. Make sure frontend is running: cd apps/frontend && npm run dev');
console.log('3. Go to: http://localhost:3020/start');
console.log('4. Enter the Session ID above');
console.log('5. Enter the Student Name above');
console.log('6. Click "Start Quiz"');
console.log('');

console.log('🎯 Or try Practice Mode:');
console.log('- Click "Practice Word" for instant testing');
console.log('- No session ID needed');
console.log('');

console.log('📝 Copy this Session ID:');
console.log('========================');
console.log(sessionId);
console.log('');

console.log('🎨 Frontend URL: http://localhost:3020/start');
console.log('🔧 Backend URL: http://localhost:3001');
