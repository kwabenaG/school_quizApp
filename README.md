# 🎓 School Quiz - Monorepo

A comprehensive quiz application for schools with scrambled word guessing games, built with Next.js frontend and NestJS backend.

## 🏗️ Monorepo Structure

```
schoolQuiz/
├── apps/
│   ├── frontend/          # Next.js 14 Frontend
│   │   ├── src/app/       # App Router pages
│   │   │   ├── page.tsx           # Homepage
│   │   │   ├── quiz-master/       # Teacher control interface
│   │   │   ├── start/             # Student practice mode
│   │   │   └── admin/             # Admin dashboard
│   │   ├── components/    # Reusable UI components
│   │   └── package.json
│   └── backend/           # NestJS Backend
│       ├── src/
│       │   ├── entities/          # Database entities
│       │   ├── words/             # Word management module
│       │   ├── quiz/              # Quiz session module
│       │   └── main.ts            # Application entry point
│       └── package.json
├── package.json           # Root package.json (monorepo config)
├── sample-words.csv       # Sample word data for testing
├── DEPLOYMENT.md          # Deployment guide
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL (or Supabase account)

### Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd schoolQuiz

# Install dependencies for all workspaces
npm install

# Set up environment variables
cp apps/backend/env.example apps/backend/.env
# Edit apps/backend/.env with your database credentials
```

### Development
```bash
# Start both frontend and backend in development mode
npm run dev

# Or start individually
npm run dev:frontend  # Frontend on http://localhost:3020
npm run dev:backend   # Backend on http://localhost:3001
```

### Database Setup
```bash
# Seed the database with sample words
npm run seed
```

## 🎯 Features

### 🎓 Quiz Master Interface (`/quiz-master`)
- **Time Setup**: Configure time limits for each word
- **Word Projection**: Large, centered scrambled word display
- **Timer Control**: Visual timer with auto-reveal
- **Answer Management**: Modal reveal of correct answers
- **Session Control**: Start, reveal, next word controls

### 🎮 Student Practice Mode (`/start`)
- **Individual Practice**: Students can practice alone
- **Timer Display**: Visual countdown for each word
- **Answer Submission**: Submit guesses and get feedback
- **Session Tracking**: Track progress and performance

### ⚙️ Admin Dashboard (`/admin`)
- **CSV Import**: Bulk import words from CSV files
- **Word Management**: Add, edit, delete words
- **Bulk Operations**: Select and delete multiple words
- **Content Control**: Manage difficulty levels and clues

### 🏠 Homepage (`/`)
- **Navigation Hub**: Links to all interfaces
- **Feature Overview**: Description of capabilities
- **Quick Access**: Direct links to quiz modes

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful component library
- **React Hooks** - State management

### Backend
- **NestJS** - Scalable Node.js framework
- **TypeORM** - Database ORM
- **PostgreSQL** - Primary database
- **Supabase** - Database hosting and real-time features
- **Multer** - File upload handling

### Database
- **Supabase** - PostgreSQL with real-time capabilities
- **TypeORM Entities** - Word, QuizSession, QuizAttempt

## 📊 API Endpoints

### Words Management
- `GET /words` - Get all words
- `POST /words` - Create new word
- `PUT /words/:id` - Update word
- `DELETE /words/:id` - Delete word
- `POST /words/import-csv` - Import words from CSV
- `POST /words/bulk-delete` - Delete multiple words
- `GET /words/random/word` - Get random word for quiz

### Quiz Sessions
- `POST /quiz/sessions` - Create quiz session
- `GET /quiz/sessions/:id` - Get session details
- `POST /quiz/sessions/:id/start` - Start session
- `GET /quiz/sessions/:id/current-word` - Get current word
- `POST /quiz/sessions/:id/submit-answer` - Submit answer

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd apps/frontend
vercel --prod
```

### Backend (Railway)
```bash
cd apps/backend
railway up
```

### Environment Variables

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

#### Backend (.env)
```env
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
SUPABASE_DB_URL=postgresql://postgres:password@host:5432/postgres
```

## 📝 CSV Import Format

Create a CSV file with the following format:
```csv
word,clue,difficulty
ocean,A large body of water,easy
butterfly,A colorful insect that flies,medium
adventure,An exciting or unusual experience,hard
```

## 🎮 Usage

### For Teachers
1. **Setup Quiz**: Go to `/quiz-master`, set time limit
2. **Start Session**: Click "Start Quiz Session"
3. **Control Flow**: Use "Start Word", "Reveal Answer", "Next Word"
4. **Project**: Display is optimized for classroom projection

### For Students
1. **Practice Mode**: Go to `/start`
2. **Enter Details**: Name and session ID (optional)
3. **Play**: Guess scrambled words with timer
4. **Track Progress**: See performance feedback

### For Admins
1. **Manage Content**: Go to `/admin`
2. **Import Words**: Upload CSV files with word lists
3. **Add Words**: Use the form to add individual words
4. **Bulk Operations**: Select and manage multiple words

## 🔧 Development Scripts

```bash
# Development
npm run dev                 # Start both frontend and backend
npm run dev:frontend       # Start only frontend
npm run dev:backend        # Start only backend

# Building
npm run build              # Build both applications
npm run build --workspace=apps/frontend  # Build frontend only
npm run build --workspace=apps/backend   # Build backend only

# Testing
npm run test               # Run tests for all workspaces
npm run lint               # Lint all workspaces

# Database
npm run seed               # Seed database with sample data

# Deployment
npm run deploy:frontend    # Deploy frontend to Vercel
npm run deploy:backend     # Deploy backend to Railway
npm run deploy:all         # Deploy both applications
```

## 📁 Key Files

- `package.json` - Monorepo configuration and scripts
- `apps/frontend/src/app/quiz-master/page.tsx` - Quiz master interface
- `apps/frontend/src/app/start/page.tsx` - Student practice mode
- `apps/frontend/src/app/admin/page.tsx` - Admin dashboard
- `apps/backend/src/words/` - Word management API
- `apps/backend/src/quiz/` - Quiz session API
- `sample-words.csv` - Sample data for testing
- `DEPLOYMENT.md` - Detailed deployment instructions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Check the [Deployment Guide](DEPLOYMENT.md)
- Review the API documentation
- Open an issue on GitHub

---

**🎉 Built with ❤️ for educational purposes**