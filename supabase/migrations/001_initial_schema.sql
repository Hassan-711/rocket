-- Rise Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =====================
-- PROFILES
-- =====================
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  bio text,
  avatar_url text,
  university text default 'Amity University Lucknow',
  degree text default 'B.Tech CSE',
  enrollment_no text default 'A7605224098',
  current_semester int default 4,
  cgpa float default 8.86,
  career_goal text default 'AI-Powered Backend Engineer',
  linkedin_url text,
  github_url text,
  portfolio_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =====================
-- SKILLS
-- =====================
create table if not exists skills (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  name text not null,
  category text not null, -- 'language', 'framework', 'tool', 'soft'
  proficiency int default 50, -- 0-100
  created_at timestamptz default now()
);

-- =====================
-- CERTIFICATIONS
-- =====================
create table if not exists certifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  name text not null,
  issuer text not null,
  issue_date date,
  expiry_date date,
  credential_id text,
  file_url text,
  cert_url text,
  created_at timestamptz default now()
);

-- =====================
-- PROJECTS
-- =====================
create table if not exists projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  description text,
  tech_stack text[], -- array of technologies
  github_url text,
  live_url text,
  start_date date,
  end_date date,
  status text default 'completed', -- 'in_progress', 'completed', 'planned'
  highlights text[],
  created_at timestamptz default now()
);

-- =====================
-- ACADEMICS
-- =====================
create table if not exists academics (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  degree text,
  institution text,
  start_year int,
  end_year int,
  score text,
  score_type text default 'CGPA', -- 'CGPA', 'percentage', 'grade'
  description text,
  created_at timestamptz default now()
);

-- =====================
-- WORK EXPERIENCE
-- =====================
create table if not exists work_experience (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  company text not null,
  role text not null,
  start_date date,
  end_date date,
  is_current boolean default false,
  description text,
  skills_used text[],
  created_at timestamptz default now()
);

-- =====================
-- SEMESTERS
-- =====================
create table if not exists semesters (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  number int not null,
  name text,
  start_date date,
  end_date date,
  is_current boolean default false,
  sgpa float,
  created_at timestamptz default now()
);

-- =====================
-- SUBJECTS
-- =====================
create table if not exists subjects (
  id uuid default uuid_generate_v4() primary key,
  semester_id uuid references semesters(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  name text not null,
  code text,
  credits int default 3,
  progress int default 0, -- 0-100
  priority text default 'medium', -- 'high', 'medium', 'low'
  exam_date date,
  syllabus_topics jsonb default '[]', -- [{topic, done}]
  color text default '#6366f1',
  created_at timestamptz default now()
);

-- =====================
-- STUDY MATERIALS
-- =====================
create table if not exists study_materials (
  id uuid default uuid_generate_v4() primary key,
  subject_id uuid references subjects(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  name text not null,
  type text default 'pdf', -- 'pdf', 'ppt', 'doc', 'link', 'note'
  file_url text,
  external_url text,
  size_bytes bigint,
  created_at timestamptz default now()
);

-- =====================
-- TASKS
-- =====================
create table if not exists tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  description text,
  priority text default 'medium', -- 'urgent', 'high', 'medium', 'low'
  status text default 'pending', -- 'pending', 'in_progress', 'completed', 'missed'
  due_date timestamptz,
  completed_at timestamptz,
  tags text[],
  related_subject_id uuid references subjects(id),
  created_at timestamptz default now()
);

-- =====================
-- FOCUS SESSIONS (Pomodoro)
-- =====================
create table if not exists focus_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  task_id uuid references tasks(id),
  subject_id uuid references subjects(id),
  duration_minutes int not null,
  session_type text default 'pomodoro', -- 'pomodoro', 'short_break', 'long_break', 'free'
  started_at timestamptz default now(),
  ended_at timestamptz,
  notes text
);

-- =====================
-- CAREER GOALS
-- =====================
create table if not exists career_goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  description text,
  category text not null, -- 'dsa', 'backend', 'ai_ml', 'project', 'internship', 'placement'
  target_date date,
  status text default 'pending', -- 'pending', 'active', 'completed'
  priority int default 5, -- 1-10
  created_at timestamptz default now()
);

-- =====================
-- CAREER MILESTONES
-- =====================
create table if not exists career_milestones (
  id uuid default uuid_generate_v4() primary key,
  goal_id uuid references career_goals(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  description text,
  target_date date,
  completed_at date,
  status text default 'pending', -- 'pending', 'active', 'completed'
  resources text[], -- links, notes
  created_at timestamptz default now()
);

-- =====================
-- ANALYTICS LOGS
-- =====================
create table if not exists analytics_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  date date default current_date,
  study_minutes int default 0,
  tasks_completed int default 0,
  tasks_total int default 0,
  focus_sessions int default 0,
  streak_day int default 0,
  notes text,
  created_at timestamptz default now(),
  unique(user_id, date)
);

-- =====================
-- ROW LEVEL SECURITY
-- =====================
alter table profiles enable row level security;
alter table skills enable row level security;
alter table certifications enable row level security;
alter table projects enable row level security;
alter table academics enable row level security;
alter table work_experience enable row level security;
alter table semesters enable row level security;
alter table subjects enable row level security;
alter table study_materials enable row level security;
alter table tasks enable row level security;
alter table focus_sessions enable row level security;
alter table career_goals enable row level security;
alter table career_milestones enable row level security;
alter table analytics_logs enable row level security;

-- Profiles RLS
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Generic user-scoped RLS for all other tables
do $$
declare
  t text;
begin
  foreach t in array array['skills','certifications','projects','academics','work_experience','semesters','subjects','study_materials','tasks','focus_sessions','career_goals','career_milestones','analytics_logs']
  loop
    execute format('create policy "Users manage own %I" on %I for all using (auth.uid() = user_id)', t, t);
  end loop;
end;
$$;

-- =====================
-- FUNCTION: auto-create profile on signup
-- =====================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
