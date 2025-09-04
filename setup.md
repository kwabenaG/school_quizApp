# 🚀 School Quiz Setup Guide

This guide will help you set up the School Quiz Application on your local machine.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **PostgreSQL** - [Download here](https://www.postgresql.org/download/)
- **Git** - [Download here](https://git-scm.com/)

## Step 1: Database Setup

1. **Install PostgreSQL** and start the service
2. **Create a database** for the application:
   ```sql
   CREATE DATABASE school_quiz;
   ```
3. **Note your database credentials** (host, port, username, password)

## Step 2: Environment Configuration

1. **Copy the environment template**:
   ```bash
   cp apps/backend/env.example apps/backend/.env
   ```

2. **Edit the `.env` file** with your database credentials:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   DB_NAME=school_quiz

   # Application Configuration
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

## Step 3: Install Dependencies

From the project root directory:

```bash
npm install
```

This will install dependencies for both frontend and backend.

## Step 4: Seed the Database

Run the seed script to populate the database with sample words:

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

## Step 5: Start the Application

### Option 1: Start Both Services Together
```bash
npm run dev
```

### Option 2: Start Services Individually

**Terminal 1 - Backend:**
```bash
npm run dev:backend
```

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
```

## Step 6: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/health

## 🎮 Testing the Application

### 1. Test the Homepage
- Visit http://localhost:3000
- You should see the School Quiz homepage with navigation options

### 2. Test the Admin Dashboard
- Click "Admin Dashboard" or visit http://localhost:3000/admin
- Try adding a new word with clue and difficulty
- Create a new quiz session

### 3. Test the Quiz Interface
- Click "Join Quiz" or visit http://localhost:3000/quiz
- Enter a session code (any code works in demo mode)
- Enter your name and start playing

## 🔧 Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check your database credentials in `.env`
- Ensure the `school_quiz` database exists

### Port Already in Use
- Change the PORT in `.env` file
- Or kill the process using the port:
  ```bash
  # Find process using port 3001
  lsof -i :3001
  # Kill the process
  kill -9 <PID>
  ```

### Frontend Not Loading
- Check if the backend is running on port 3001
- Verify CORS settings in backend
- Check browser console for errors

## 📚 Next Steps

1. **Customize Words**: Add your own words and clues in the admin dashboard
2. **Create Sessions**: Set up quiz sessions for your students
3. **Test with Students**: Have students join and play the quiz
4. **Monitor Progress**: Use the admin dashboard to track performance

## 🆘 Need Help?

- Check the [README.md](README.md) for detailed documentation
- Review the API endpoints in the backend code
- Check the browser console and terminal for error messages

---

**Happy Quizzing!** 🎓✨
