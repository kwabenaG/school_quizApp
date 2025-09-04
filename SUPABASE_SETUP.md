# 🚀 Supabase Setup Guide for School Quiz

This guide will help you set up Supabase as your database for the School Quiz application.

## 📋 Prerequisites

- A Supabase account ([sign up here](https://supabase.com))
- Your School Quiz project files

## 🎯 Step 1: Create Supabase Project

1. **Go to [https://supabase.com](https://supabase.com)** and sign in
2. **Click "New Project"**
3. **Fill in the project details:**
   - **Organization**: Select your organization
   - **Project Name**: `school-quiz-app` (or your preferred name)
   - **Database Password**: Create a strong password and **save it securely**
   - **Region**: Choose the region closest to your users
4. **Click "Create new project"**
5. **Wait for setup to complete** (usually 1-2 minutes)

## 🔑 Step 2: Get Your Supabase Credentials

Once your project is ready:

1. **Navigate to Settings → API** in your Supabase dashboard
2. **Copy these values:**

### Project URL
- Format: `https://your-project-id.supabase.co`
- This is your `SUPABASE_URL`

### API Keys
- **anon public key**: Safe for client-side use
- **service_role key**: ⚠️ **Keep secret!** Server-side only

### Database Password
- The password you created when setting up the project
- This is your `SUPABASE_DB_PASSWORD`

## ⚙️ Step 3: Configure Your Environment

1. **Copy the environment template:**
   ```bash
   cp apps/backend/env.example apps/backend/.env
   ```

2. **Edit `apps/backend/.env`** with your Supabase credentials:
   ```env
   # Application Configuration
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000

   # Supabase Configuration
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_DB_PASSWORD=your_database_password
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

   **Replace the placeholder values with your actual Supabase credentials.**

## 🗄️ Step 4: Set Up Database Tables

The application will automatically create the necessary tables when you run it, but let's verify the setup:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Seed the database with sample words:**
   ```bash
   cd apps/backend
   npm run seed
   ```

   You should see output like:
   ```
   📊 Database connected successfully
   🗑️ Cleared existing words
   ✅ Seeded 30 words successfully
   🎉 Database seeding completed!
   ```

## 🚀 Step 5: Start the Application

1. **Start both frontend and backend:**
   ```bash
   npm run dev
   ```

2. **Or start individually:**
   ```bash
   # Terminal 1 - Backend
   npm run dev:backend

   # Terminal 2 - Frontend  
   npm run dev:frontend
   ```

## ✅ Step 6: Verify Setup

1. **Check the backend health:**
   - Visit: http://localhost:3001/health
   - You should see: `{"status":"ok","timestamp":"..."}`

2. **Check the frontend:**
   - Visit: http://localhost:3000
   - You should see the School Quiz homepage

3. **Test the admin dashboard:**
   - Visit: http://localhost:3000/admin
   - Try adding a new word

4. **Test the quiz interface:**
   - Visit: http://localhost:3000/quiz
   - Enter any session code and your name

## 🔍 Step 7: Verify in Supabase Dashboard

1. **Go to your Supabase project dashboard**
2. **Navigate to Table Editor**
3. **You should see these tables:**
   - `words` - Contains your quiz words and clues
   - `quiz_sessions` - Quiz session data
   - `quiz_attempts` - Student attempt records

## 🎯 Database Schema Overview

### Words Table
- `id` - Unique identifier
- `word` - The actual word
- `clue` - Hint for the word
- `difficulty` - Easy, Medium, or Hard
- `timesUsed` - Usage counter
- `isActive` - Whether available for quizzes
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### Quiz Sessions Table
- `id` - Unique session identifier
- `name` - Session name
- `status` - Pending, Active, Paused, Completed, or Cancelled
- `currentWordId` - Currently active word
- `currentWordIndex` - Progress through word list
- `usedWordIds` - Array of words already used
- `totalWords` - Total number of words in session
- `correctAnswers` - Number of correct answers
- `totalAttempts` - Total number of attempts
- `startedAt` - Session start time
- `endedAt` - Session end time
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### Quiz Attempts Table
- `id` - Unique attempt identifier
- `quizSessionId` - Reference to quiz session
- `wordId` - Reference to word
- `contestantName` - Student's name
- `answer` - Student's answer
- `isCorrect` - Whether answer was correct
- `attemptNumber` - Attempt number for this word
- `timeSpent` - Time taken to answer (seconds)
- `createdAt` - Creation timestamp

## 🔧 Troubleshooting

### Connection Issues
- **Verify your credentials** in the `.env` file
- **Check your database password** is correct
- **Ensure your Supabase project is active**

### SSL Certificate Issues
- The application is configured to handle Supabase's SSL certificates
- If you encounter SSL issues, check your network connection

### Table Creation Issues
- **Run the seed script** to ensure tables are created
- **Check the Supabase logs** in your dashboard

### Port Issues
- **Backend runs on port 3001** by default
- **Frontend runs on port 3000** by default
- Change ports in `.env` if needed

## 🎉 You're All Set!

Your School Quiz application is now running with Supabase as the database. You can:

- **Add words and clues** in the admin dashboard
- **Create quiz sessions** for your students
- **Monitor progress** in real-time
- **Scale easily** with Supabase's cloud infrastructure

## 🔄 Switching Between Local and Supabase

The application automatically detects whether you're using Supabase or local PostgreSQL:

- **With Supabase**: Set `SUPABASE_URL` in your `.env` file
- **Local PostgreSQL**: Don't set `SUPABASE_URL`, use local database settings

## 📚 Next Steps

1. **Customize your words** in the admin dashboard
2. **Create quiz sessions** for your students
3. **Test with real students**
4. **Monitor performance** in Supabase dashboard
5. **Deploy to production** when ready

---

**Happy Quizzing with Supabase!** 🎓✨
