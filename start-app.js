#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting School Quiz Application...\n');

// Start backend
console.log('📡 Starting backend server...');
const backend = spawn('npm', ['run', 'dev:backend'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

// Wait a moment then start frontend
setTimeout(() => {
  console.log('🎨 Starting frontend server...');
  const frontend = spawn('npm', ['run', 'dev:frontend'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down servers...');
    backend.kill();
    frontend.kill();
    process.exit(0);
  });

}, 2000);

console.log('✅ Servers starting...');
console.log('🌐 Frontend: http://localhost:3020');
console.log('🔧 Backend: http://localhost:3001');
console.log('🎓 Quiz Start Page: http://localhost:3020/start');
console.log('\nPress Ctrl+C to stop servers');
