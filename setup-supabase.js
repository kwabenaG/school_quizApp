#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 School Quiz - Supabase Setup Helper\n');

const questions = [
  {
    key: 'SUPABASE_URL',
    question: 'Enter your Supabase Project URL (e.g., https://your-project-id.supabase.co): ',
    validate: (value) => value.startsWith('https://') && value.includes('supabase.co')
  },
  {
    key: 'SUPABASE_DB_PASSWORD',
    question: 'Enter your Supabase Database Password: ',
    validate: (value) => value.length >= 8
  },
  {
    key: 'SUPABASE_ANON_KEY',
    question: 'Enter your Supabase Anon Key: ',
    validate: (value) => value.startsWith('eyJ')
  },
  {
    key: 'SUPABASE_SERVICE_ROLE_KEY',
    question: 'Enter your Supabase Service Role Key: ',
    validate: (value) => value.startsWith('eyJ')
  }
];

const envPath = path.join(__dirname, 'apps', 'backend', '.env');
const envExamplePath = path.join(__dirname, 'apps', 'backend', 'env.example');

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question.question, (answer) => {
      if (question.validate && !question.validate(answer.trim())) {
        console.log('❌ Invalid input. Please try again.\n');
        askQuestion(question).then(resolve);
      } else {
        resolve(answer.trim());
      }
    });
  });
}

async function setupSupabase() {
  try {
    console.log('This helper will create your .env file with Supabase configuration.\n');
    console.log('You can find these values in your Supabase dashboard under Settings → API\n');

    const config = {};

    for (const question of questions) {
      config[question.key] = await askQuestion(question);
    }

    // Read the example file
    const envExample = fs.readFileSync(envExamplePath, 'utf8');
    
    // Replace the placeholder values
    let envContent = envExample
      .replace('SUPABASE_URL=https://your-project-id.supabase.co', `SUPABASE_URL=${config.SUPABASE_URL}`)
      .replace('SUPABASE_DB_PASSWORD=your_database_password', `SUPABASE_DB_PASSWORD=${config.SUPABASE_DB_PASSWORD}`)
      .replace('SUPABASE_ANON_KEY=your_supabase_anon_key', `SUPABASE_ANON_KEY=${config.SUPABASE_ANON_KEY}`)
      .replace('SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key', `SUPABASE_SERVICE_ROLE_KEY=${config.SUPABASE_SERVICE_ROLE_KEY}`);

    // Write the .env file
    fs.writeFileSync(envPath, envContent);

    console.log('\n✅ Environment file created successfully!');
    console.log('📁 Location: apps/backend/.env');
    console.log('\n🚀 Next steps:');
    console.log('1. Run: npm install');
    console.log('2. Run: cd apps/backend && npm run seed');
    console.log('3. Run: npm run dev');
    console.log('\n🎉 Your School Quiz app is ready to go!');

  } catch (error) {
    console.error('❌ Error setting up Supabase:', error.message);
  } finally {
    rl.close();
  }
}

setupSupabase();
