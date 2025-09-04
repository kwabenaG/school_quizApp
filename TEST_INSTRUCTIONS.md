# 🎓 School Quiz Test Instructions

## 🚀 Quick Test Setup

### 1. Start the Backend Server
```bash
cd apps/backend
npm run dev
```
The backend will run on: http://localhost:3001

### 2. Start the Frontend Server
```bash
cd apps/frontend  
npm run dev
```
The frontend will run on: http://localhost:3020

### 3. Test the Quiz Interface

#### Option A: Practice Mode (No Session ID needed)
1. Go to: http://localhost:3020/start
2. Click "Practice Word" button
3. You'll get a random scrambled word to test with

#### Option B: Full Quiz Session
1. Go to: http://localhost:3020/start
2. Enter Session ID: `test-session-123`
3. Enter Student Name: `Test Student`
4. Click "Start Quiz"

## 🎯 Test Session Details

**Session ID:** `test-session-123`
**Student Name:** `Test Student`
**Quiz URL:** http://localhost:3020/start

## 🎮 What to Test

1. **Beautiful Interface**: Check the colorful, animated design
2. **Huge Scrambled Word**: See the massive word display
3. **Clear Clue**: Read the helpful clue
4. **Answer Input**: Type your guess
5. **Feedback**: See if you got it right or wrong
6. **Next Word**: Try another word

## 📝 Sample Words in Database

The database contains 30 sample words including:
- **Easy**: CAT, DOG, SUN, MOON, STAR
- **Medium**: OCEAN, FOREST, MOUNTAIN, RIVER, DESERT  
- **Hard**: ELEPHANT, BUTTERFLY, RAINBOW, UNIVERSE, ADVENTURE

## 🔧 API Endpoints

- **Health Check**: http://localhost:3001/health
- **Random Word**: http://localhost:3001/words/random/word
- **All Words**: http://localhost:3001/words

## 🎨 Features to Notice

- ✨ Beautiful gradient backgrounds
- 🎯 Animated bouncing elements
- 📱 Large, student-friendly buttons
- 🎓 Fun emojis throughout
- 🌈 Colorful, engaging design
- 📝 Clear, easy-to-read text

## 🚨 Troubleshooting

If you get errors:
1. Make sure both servers are running
2. Check that the database is seeded (run `npm run seed`)
3. Verify the backend is on port 3001
4. Verify the frontend is on port 3020

Happy testing! 🎉
