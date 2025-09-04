#!/usr/bin/env node

const fetch = require('node-fetch');

console.log('🎓 School Quiz Test Helper\n');

// Test session details
const testSessionName = 'Test Quiz Session';
const testStudentName = 'John Student';

console.log('📝 Test Details:');
console.log('================');
console.log(`Session Name: ${testSessionName}`);
console.log(`Student Name: ${testStudentName}`);
console.log('');

async function createTestSession() {
  try {
    console.log('🚀 Creating test quiz session...');
    
    // Create a new quiz session
    const response = await fetch('http://localhost:3001/quiz/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: testSessionName,
        totalWords: 5
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const session = await response.json();
    
    console.log('✅ Session created successfully!');
    console.log('');
    console.log('🎯 Test Information:');
    console.log('===================');
    console.log(`Session ID: ${session.id}`);
    console.log(`Session Name: ${session.name}`);
    console.log(`Total Words: ${session.totalWords}`);
    console.log('');
    
    // Start the session
    console.log('🚀 Starting the quiz session...');
    const startResponse = await fetch(`http://localhost:3001/quiz/sessions/${session.id}/start`, {
      method: 'POST',
    });

    if (!startResponse.ok) {
      throw new Error(`Failed to start session: ${startResponse.status}`);
    }

    const startedSession = await startResponse.json();
    console.log('✅ Session started successfully!');
    console.log('');
    
    console.log('🎮 Ready to Test!');
    console.log('=================');
    console.log('1. Go to: http://localhost:3020/start');
    console.log('2. Enter Session ID:', session.id);
    console.log('3. Enter Student Name:', testStudentName);
    console.log('4. Click "Start Quiz"');
    console.log('');
    console.log('📊 Or try Practice Mode:');
    console.log('- Click "Practice Word" for a random word');
    console.log('- No session ID needed for practice');
    console.log('');
    console.log('🔧 Backend API: http://localhost:3001');
    console.log('🎨 Frontend: http://localhost:3020');
    console.log('🎓 Quiz Start: http://localhost:3020/start');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('');
    console.log('🔧 Make sure the backend is running:');
    console.log('   cd apps/backend && npm run dev');
    console.log('');
    console.log('📝 Manual Test Details:');
    console.log('======================');
    console.log('Session ID: test-session-123');
    console.log('Student Name: Test Student');
    console.log('Or use Practice Mode (no session ID needed)');
  }
}

// Check if backend is running first
async function checkBackend() {
  try {
    const response = await fetch('http://localhost:3001/health');
    if (response.ok) {
      console.log('✅ Backend is running!');
      await createTestSession();
    } else {
      throw new Error('Backend not responding');
    }
  } catch (error) {
    console.log('⚠️  Backend not running. Here are manual test details:');
    console.log('');
    console.log('📝 Manual Test Information:');
    console.log('===========================');
    console.log('Session ID: test-session-123');
    console.log('Student Name: Test Student');
    console.log('Or use Practice Mode (no session ID needed)');
    console.log('');
    console.log('🚀 To start the backend:');
    console.log('   cd apps/backend && npm run dev');
    console.log('');
    console.log('🎨 To start the frontend:');
    console.log('   cd apps/frontend && npm run dev');
    console.log('');
    console.log('🌐 Then visit: http://localhost:3020/start');
  }
}

checkBackend();
