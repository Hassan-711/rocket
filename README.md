# 🚀 Rise: AI-Powered Personal Productivity & Career OS

> A premium full-stack dashboard for tracking your career roadmap, study progress, daily tasks, and analytics. Built for modern engineering students, featuring an integrated Explainable AI (XAI) academic prediction engine.

*Developed as a core component of the "Student Academic Performance Prediction supported by Explainable AI" NTCC project.*

## ✨ Features & Modules
| Module | Description |
|--------|-------------|
| **Dashboard** | Summary cards, today's top tasks, streak, exam countdown, career progress. |
| **AI Predictor** | Machine Learning dashboard that analyzes 14 student metrics to predict exam success, providing SHAP-based actionable insights. |
| **Roadmap** | Auto-seeded career path, milestone timeline, auto-generated tasks via Gemini AI, and 1-click Markdown export. |
| **Tasks** | Daily targets, Pomodoro timer, streak tracking, priority tags. |
| **Studies** | Semester & subject tracking, syllabus topics, exam dates, material upload. |
| **Analytics** | Study hours, productivity score, subject comparison, skill radar chart. |
| **Resume** | Skills, projects, certifications, experience, ATS PDF export. |
| **Settings** | Profile, appearance (dark/light), notifications, data export. |

## 🛠 Complete Tech Stack
### **Frontend (Next.js)**
* **Framework:** Next.js 14 (App Router, TypeScript)
* **Styling & UI:** Tailwind CSS, shadcn/ui components, Framer Motion
* **Charts:** Recharts
* **Deployment:** Vercel

### **Backend & Database**
* **Database & Auth:** Supabase (PostgreSQL + Row Level Security + SSR Auth)
* **API Architecture:** Next.js API Rewrites proxying to an independent Microservice

### **Machine Learning & AI (FastAPI Microservice)**
* **Predictive Model:** **Random Forest Classifier** (Trained via Scikit-learn on UCI Student Performance Dataset)
* **Explainable AI (XAI):** **SHAP** (SHapley Additive exPlanations) for decoding model logic.
* **Generative AI:** Google **Gemini 2.5 Flash API** for dynamic roadmap generation.
* **ML Backend Framework:** FastAPI (Python), Uvicorn, deployed on Render.

## 📂 Complete Project Structure

### ```text
rise/
├── src/
│   ├── app/
│   │   ├── auth/           # Login, Signup, Forgot Password
│   │   ├── dashboard/      # Home dashboard
│   │   ├── resume/         # Resume module
│   │   ├── studies/        # Study tracking
│   │   ├── tasks/          # Daily tasks + Pomodoro
│   │   ├── roadmap/        # AI Career roadmap & Markdown Export
│   │   ├── ai-predictor/   # XAI Student Performance Predictor
│   │   ├── analytics/      # Charts & analytics
│   │   └── settings/       # App settings
│   ├── components/
│   │   ├── ui/             # shadcn base components
│   │   ├── layout/         # Sidebar, Navbar, AppShell
│   │   ├── dashboard/      # StatCard, etc.
│   │   └── shared/         # ThemeProvider, Skeleton, EmptyState
│   ├── lib/
│   │   ├── supabase/       # Client, Server, Middleware (SSR)
│   │   ├── hooks/          # Custom hooks (e.g., useUser)
│   │   ├── types/          # All TypeScript types
│   │   └── utils/          # Helpers + seed data
│   └── styles/
│       └── globals.css     # Design tokens & utilities
├── supabase/
│   └── migrations/         # Database schema SQL files
├── public/                 # Static assets & icons
├── .env.local.example      # Env template
├── next.config.js          # Next.js config (API proxy settings for ML Backend)
├── tailwind.config.ts      # Tailwind & Framer Motion config
└── package.json            # Node dependencies.

## 🗄️ Database Schema
Tables managed via Supabase PostgreSQL:
profiles · skills · certifications · projects · academics · work_experience · semesters · subjects · study_materials · tasks · focus_sessions · career_goals · career_milestones · analytics_logs

All tables have Row Level Security (RLS) applied—users can only access their own data securely.

## ⚙️ Local Setup

### 1. Clone the repository
    Bash
    git clone [https://github.com/hassan/riseos.git](https://github.com/hassan/riseos.git)
    cd riseos
    npm install

### 2. Set up Supabase
Create a project at Supabase.

Go to SQL Editor and run supabase/migrations/001_initial_schema.sql.

Enable Email Auth in Authentication > Providers.

### 3. Configure Environment Variables
    Bash
    cp .env.local.example .env.local

Fill in your Supabase URL, keys, and the ML API endpoint:
    
    Code snippet
    NEXT_PUBLIC_SUPABASE_URL=[https://your-project.supabase.co](https://your-project.supabase.co)
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
    SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

    # Proxy to ML Microservice
    NEXT_PUBLIC_ML_API_URL=http://localhost:8000 # Use Render URL in production

### 4. Run Locally

    Bash
    npm run dev
Open http://localhost:3000.