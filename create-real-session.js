#!/usr/bin/env node

const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');

console.log('🎓 Creating Real Quiz Session for Testing\n');

const sessionName = 'Test Quiz Session';
const studentName = 'Test Student';

async function createRealSession() {
  try {
    console.log('🚀 Creating quiz session...');
    
    // Create a new quiz session
    const createResponse = await fetch('http://localhost:3001/quiz/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: sessionName,
        totalWords: 5
      }),
    });

    if (!createResponse.ok) {
      throw new Error(`Failed to create session: ${createResponse.status}`);
    }

    const session = await createResponse.json();
    console.log('✅ Session created successfully!');
    console.log('');
    console.log('📝 Test Information:');
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
    console.log('3. Enter Student Name:', studentName);
    console.log('4. Click "Start Quiz"');
    console.log('');
    console.log('📝 Copy this Session ID:');
    console.log('========================');
    console.log(session.id);
    console.log('');
    console.log('🎨 Frontend: http://localhost:3020/start');
    console.log('🔧 Backend: http://localhost:3001');

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
      await createRealSession();
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
