# School Quiz - Deployment Guide

## 🚀 Quick Deployment

### Frontend (Vercel)
1. **Connect to Vercel:**
   ```bash
   npm install -g vercel
   cd apps/frontend
   vercel
   ```

2. **Environment Variables:**
   - `NEXT_PUBLIC_API_URL`: Your Railway backend URL (e.g., `https://your-app.railway.app`)

### Backend (Railway)
1. **Railway Deployment:**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and deploy
   railway login
   cd apps/backend
   railway up
   ```

2. **Environment Variables:**
   - `PORT`: 3001 (auto-set by Railway)
   - `NODE_ENV`: production
   - `SUPABASE_DB_URL`: Your Supabase connection string
   - `FRONTEND_URL`: Your Vercel frontend URL (e.g., `https://your-app.vercel.app`)

### Database (Supabase)
1. **Create Supabase Project:**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Get connection string from Settings > Database

2. **Run Database Migrations:**
   ```bash
   cd apps/backend
   npm run seed
   ```

## 📁 Project Structure
```
schoolQuiz/
├── apps/
│   ├── frontend/          # Next.js frontend
│   └── backend/           # NestJS backend
├── sample-words.csv       # Sample word data
└── DEPLOYMENT.md          # This file
```

## 🔧 Environment Setup

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

### Backend (.env)
```env
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.com
SUPABASE_DB_URL=postgresql://postgres:password@host:5432/postgres
```

## 📊 Features Ready for Production

### ✅ Completed Features:
- **Quiz Master Control System** - Time setup, word projection, answer reveal
- **Student Practice Mode** - Individual word practice with timer
- **Admin Dashboard** - CSV import, word management, bulk operations
- **Responsive Design** - Works on all devices
- **Database Integration** - Supabase PostgreSQL with TypeORM
- **API Endpoints** - Complete REST API for all operations

### 🎯 Key URLs:
- **Homepage**: `/` - Main landing page
- **Quiz Master**: `/quiz-master` - Teacher control interface
- **Practice Mode**: `/start` - Student practice interface
- **Admin Dashboard**: `/admin` - Content management

## 🚀 One-Click Deploy

### Vercel (Frontend)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/schoolQuiz&env=NEXT_PUBLIC_API_URL)

### Railway (Backend)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/your-template)

## 🔗 **Vercel + Railway Integration:**

### **Step 1: Deploy Backend to Railway**
```bash
cd apps/backend
railway login
railway up
# Note the Railway URL (e.g., https://your-app.railway.app)
```

### **Step 2: Deploy Frontend to Vercel**
```bash
cd apps/frontend
vercel
# Set environment variable: NEXT_PUBLIC_API_URL=https://your-app.railway.app
```

### **Step 3: Update Railway Environment**
```bash
cd apps/backend
railway variables set FRONTEND_URL=https://your-app.vercel.app
```

## 📝 Post-Deployment Checklist

1. **✅ Database Setup:**
   - [ ] Supabase project created
   - [ ] Database seeded with sample words
   - [ ] Connection string configured

2. **✅ Frontend Deployment:**
   - [ ] Deployed to Vercel
   - [ ] Environment variables set
   - [ ] Domain configured

3. **✅ Backend Deployment:**
   - [ ] Deployed to Railway/Render
   - [ ] Environment variables set
   - [ ] CORS configured for frontend domain

4. **✅ Testing:**
   - [ ] Quiz Master interface works
   - [ ] CSV import functions
   - [ ] Word management works
   - [ ] Timer functionality works

## 🎓 Usage Instructions

### For Teachers:
1. **Setup Quiz:**
   - Go to `/quiz-master`
   - Set time limit for each word
   - Click "Start Quiz Session"

2. **Control Quiz:**
   - Use "Start Word" to begin
   - Use "Reveal Answer" to show correct answer
   - Use "Next Word" to continue

### For Students:
1. **Practice Mode:**
   - Go to `/start`
   - Enter name and session ID
   - Practice with scrambled words

### For Admins:
1. **Manage Content:**
   - Go to `/admin`
   - Import CSV files with words
   - Add/edit/delete words
   - Bulk operations available

## 🔒 Security Notes

- Change default JWT secrets in production
- Use HTTPS for all deployments
- Configure CORS properly
- Use environment variables for sensitive data

## 📞 Support

For deployment issues or questions, check:
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Supabase Documentation](https://supabase.com/docs)

---

**🎉 Your School Quiz application is now ready for production!**
