# PRD: Junior School Quiz Application

## 1. Overview
The Junior School Quiz Application is a web-based platform that enables a **quiz master (admin/teacher)** to create and run interactive scrabble-style quizzes for students. The quiz challenges contestants to guess scrambled words, aided by clues provided by the quiz master.

The system will consist of:
- **Admin Dashboard** for quiz management.
- **Client Page** for contestants to participate in real-time.
- **Backend Services** for quiz logic, data persistence, and authentication.

---

## 2. Goals & Objectives
- Provide a fun and educational scrabble-like word quiz for junior school students.
- Allow quiz masters to easily manage words, clues, and quiz sessions.
- Support multiple quiz runs for interactive class competitions.
- Secure login and role-based access for admins and contestants.
- Real-time feedback to contestants (correct, wrong, try again).

---

## 3. Key Features

### 3.1 Admin Dashboard (Quiz Master)
- **Authentication & Access Control** (via Clerk).
- **Add/Edit/Delete Words** with associated **clues**.
- **Start/Stop Quiz Sessions**.
- **View Quiz Progress** (e.g., which words were answered, by whom, correct vs incorrect attempts).
- **Manual control**: option to skip a word, reveal the answer, or provide extra hints.

### 3.2 Contestant Client Page
- Display scrambled word.
- Display clue from the quiz master.
- Input field for contestants to guess the word.
- Real-time validation (correct/incorrect feedback).
- Retry option or skip if allowed by the quiz master.
- Display scoreboard or progress tracker.

### 3.3 Quiz Logic
- Words stored in Supabase (word + clue + difficulty level).
- NestJS backend randomly selects a word and scrambles it.
- Words are not repeated within the same quiz run.
- Backend validates contestant answers.
- Quiz ends when all words are used or quiz master ends session.

---

## 4. User Roles
- **Admin (Quiz Master)**:
- Full control over quiz words, clues, and session management.
- Access dashboard.

- **Contestant (Student)**:
- Participate in quizzes from client interface.
- Submit answers, view results, and get real-time feedback.

---

## 5. Tech Stack
- **Frontend (Client & Admin Dashboard):** Next.js
- **Backend:** NestJS (REST API or GraphQL)
- **Database:** Supabase (Postgres + real-time features)
- **Authentication & Authorization:** Clerk
- **Deployment:** Vercel (Next.js), AWS/GCP/Azure for backend services

---

## 6. System Workflow
1. **Admin logs in** to dashboard (Clerk authentication).
2. **Admin adds words + clues** to Supabase via dashboard.
3. **Admin starts quiz session.**
4. **System randomly selects & scrambles word** → pushes to client.
5. **Contestants view scrambled word + clue** → attempt answer.
6. **System validates answer** → shows feedback:
- ✅ Correct → move to next word.
- ❌ Wrong → retry option or reveal (if enabled).
7. **Repeat** until quiz ends.
8. **Results summary** available to admin.

---

## 7. Non-Functional Requirements
- **Scalability:** Support multiple classrooms/schools with isolated sessions.
- **Security:** Role-based access control, data isolation per school.
- **Performance:** Real-time updates under 1 second delay.
- **Reliability:** Ensure no word is repeated within a session.
- **Usability:** Child-friendly UI, large fonts, simple controls.

---

## 8. Future Enhancements (Phase 2+)
- Leaderboard with scoring system.
- Multiple difficulty levels.
- Team-based play (group mode).
- Export quiz results (CSV/PDF).
- Mobile-first optimization (React Native).

---

## 9. Success Metrics
- Quiz sessions run smoothly without errors.
- Students engage actively (high participation rate).
- Admins can create and launch quizzes in < 5 minutes.
- Real-time response accuracy ≥ 99%.