// ============================================================
// Rise - Core Type Definitions
// ============================================================

export type Profile = {
  id: string
  full_name: string | null
  email: string | null
  bio: string | null
  avatar_url: string | null
  university: string | null
  degree: string | null
  enrollment_no: string | null
  current_semester: number | null
  cgpa: number | null
  career_goal: string | null
  linkedin_url: string | null
  github_url: string | null
  portfolio_url: string | null
  created_at: string
  updated_at: string
}

export type Skill = {
  id: string
  user_id: string
  name: string
  category: 'language' | 'framework' | 'tool' | 'soft' | 'database' | 'cloud'
  proficiency: number
  created_at: string
}

export type Certification = {
  id: string
  user_id: string
  name: string
  issuer: string
  issue_date: string | null
  expiry_date: string | null
  credential_id: string | null
  file_url: string | null
  cert_url: string | null
  created_at: string
}

export type Project = {
  id: string
  user_id: string
  title: string
  description: string | null
  tech_stack: string[]
  github_url: string | null
  live_url: string | null
  start_date: string | null
  end_date: string | null
  status: 'in_progress' | 'completed' | 'planned'
  highlights: string[]
  created_at: string
}

export type Academic = {
  id: string
  user_id: string
  degree: string | null
  institution: string | null
  start_year: number | null
  end_year: number | null
  score: string | null
  score_type: string | null
  description: string | null
  created_at: string
}

export type WorkExperience = {
  id: string
  user_id: string
  company: string
  role: string
  start_date: string | null
  end_date: string | null
  is_current: boolean
  description: string | null
  skills_used: string[]
  created_at: string
}

export type Semester = {
  id: string
  user_id: string
  number: number
  name: string | null
  start_date: string | null
  end_date: string | null
  is_current: boolean
  sgpa: number | null
  subjects?: Subject[]
  created_at: string
}

export type SyllabusTopic = {
  id: string
  topic: string
  done: boolean
}

export type Subject = {
  id: string
  semester_id: string | null
  user_id: string
  name: string
  code: string | null
  credits: number
  progress: number
  priority: 'high' | 'medium' | 'low'
  exam_date: string | null
  syllabus_topics: SyllabusTopic[]
  color: string
  status: 'current' | 'completed' | 'archived'
  created_at: string
  study_materials?: StudyMaterial[]
}

export type StudyMaterial = {
  id: string
  subject_id: string
  user_id: string
  name: string
  type: 'pdf' | 'ppt' | 'doc' | 'link' | 'note'
  file_url: string | null
  external_url: string | null
  size_bytes: number | null
  created_at: string
}

export type Task = {
  id: string
  user_id: string
  title: string
  description: string | null
  priority: 'urgent' | 'high' | 'medium' | 'low'
  status: 'pending' | 'in_progress' | 'completed' | 'missed'
  due_date: string | null
  completed_at: string | null
  tags: string[]
  related_subject_id: string | null
  created_at: string
}

export type FocusSession = {
  id: string
  user_id: string
  task_id: string | null
  subject_id: string | null
  duration_minutes: number
  session_type: 'pomodoro' | 'short_break' | 'long_break' | 'free'
  started_at: string
  ended_at: string | null
  notes: string | null
}

export type CareerGoal = {
  id: string
  user_id: string
  title: string
  description: string | null
  category: 'dsa' | 'backend' | 'ai_ml' | 'project' | 'internship' | 'placement' | 'system_design'
  target_date: string | null
  status: 'pending' | 'active' | 'completed'
  priority: number
  milestones?: CareerMilestone[]
  created_at: string
}

export type CareerMilestone = {
  id: string
  goal_id: string
  user_id: string
  title: string
  description: string | null
  target_date: string | null
  completed_at: string | null
  status: 'pending' | 'active' | 'completed'
  resources: string[]
  created_at: string
}

export type AnalyticsLog = {
  id: string
  user_id: string
  date: string
  study_minutes: number
  tasks_completed: number
  tasks_total: number
  focus_sessions: number
  streak_day: number
  notes: string | null
  created_at: string
}

// Dashboard summary types
export type DashboardStats = {
  todayTasks: Task[]
  streak: number
  studyHoursThisWeek: number
  semesterProgress: number
  careerProgress: number
  upcomingExams: Subject[]
  recentActivity: ActivityItem[]
}

export type ActivityItem = {
  id: string
  type: 'task_completed' | 'focus_session' | 'milestone_completed' | 'subject_updated'
  title: string
  timestamp: string
  meta?: Record<string, unknown>
}
