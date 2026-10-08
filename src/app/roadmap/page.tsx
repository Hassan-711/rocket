'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Map, ChevronDown, ChevronUp, Plus, Target, Trophy,
  Trash2, Calendar, Edit3, Check, X, Loader2, RefreshCw,
  CheckCircle2, Circle, AlertTriangle, Zap, Goal, Flag, Sparkles
} from 'lucide-react'
import { cn, formatDate, getCategoryColor } from '@/lib/utils'
import { toast } from '@/components/ui/toaster'
import {
  getCareerGoals, addCareerGoal, updateCareerGoal, deleteCareerGoal,
  addMilestone, updateMilestone, deleteMilestone,
} from '@/lib/db'
import type { CareerGoal, CareerMilestone } from '@/lib/types'
import { StatCard } from '@/components/dashboard/StatCard'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
// The proxy path we set in next.config.mjs
const API_URL = '/api' 

const CATEGORY_LABELS: Record<string, string> = {
  dsa: 'DSA', backend: 'Backend', ai_ml: 'AI/ML',
  project: 'Projects', internship: 'Internship',
  placement: 'Placement', system_design: 'System Design',
}
const CATEGORIES = Object.keys(CATEGORY_LABELS) as CareerGoal['category'][]

const STATUS_STYLES: Record<string, string> = {
  pending:   'border-slate-200 dark:border-white/10 text-slate-500 bg-slate-50 dark:bg-white/5 hover:border-indigo-400/40',
  active:    'border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10',
  completed: 'border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10',
}

// ─────────────────────────────────────────────────────────────────────────────
// Confirm Dialog (Sleek Inline Design)
// ─────────────────────────────────────────────────────────────────────────────
function ConfirmDelete({ onConfirm, onCancel, message = "Delete?" }: { onConfirm: (e: React.MouseEvent) => void; onCancel: (e: React.MouseEvent) => void; message?: string }) {
  return (
    <div 
      className="flex items-center gap-3 p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 animate-fade-in shadow-sm cursor-default" 
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
    >
      <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 hidden sm:block ml-1" />
      <p className="text-[12px] font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap px-1">{message}</p>
      <div className="flex gap-1">
        <Button type="button" size="sm" className="h-8 bg-rose-500 hover:bg-rose-600 text-white font-bold px-3 rounded-lg" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onConfirm(e); }}>Yes</Button>
        <Button type="button" size="sm" variant="ghost" className="h-8 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold px-3 rounded-lg" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCancel(e); }}>No</Button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Default form states
// ─────────────────────────────────────────────────────────────────────────────
const BLANK_GOAL = {
  title: '', description: '', category: 'dsa' as CareerGoal['category'],
  target_date: '', priority: 5,
}
const BLANK_MILESTONE = { title: '', target_date: '' }

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function RoadmapPage() {
  const [goals, setGoals] = useState<CareerGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  // Add goal form
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [newGoal, setNewGoal] = useState(BLANK_GOAL)
  const [addingGoal, setAddingGoal] = useState(false)

  // Edit goal
  const [editGoalId, setEditGoalId] = useState<string | null>(null)
  const [editGoalForm, setEditGoalForm] = useState(BLANK_GOAL)
  const [savingGoal, setSavingGoal] = useState(false)

  // Delete goal confirm
  const [deleteGoalId, setDeleteGoalId] = useState<string | null>(null)
  const [deletingGoal, setDeletingGoal] = useState(false)

  // Add milestone
  const [newMilestoneTitle, setNewMilestoneTitle] = useState<Record<string, string>>({})
  const [addingMilestone, setAddingMilestone] = useState<string | null>(null)

  // Edit milestone
  const [editMilestoneId, setEditMilestoneId] = useState<string | null>(null)
  const [editMilestoneForm, setEditMilestoneForm] = useState(BLANK_MILESTONE)
  const [savingMilestone, setSavingMilestone] = useState(false)

  // Delete milestone confirm
  const [deleteMilestoneId, setDeleteMilestoneId] = useState<string | null>(null)
  const [deletingMilestone, setDeletingMilestone] = useState(false)

  // AI Generator State
  const [showAIForm, setShowAIForm] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiDays, setAiDays] = useState(30)
  const [generatingAI, setGeneratingAI] = useState(false)

  // Export State
  const [exporting, setExporting] = useState(false)

  // ── Data loading ─────────────────────────────────────────────────────────────
  const loadGoals = useCallback(() => {
    setLoading(true)
    getCareerGoals()
      .then(d => { setGoals(d as CareerGoal[]); setLoading(false) })
      .catch(() => { toast({ title: 'Failed to load goals', variant: 'destructive' }); setLoading(false) })
  }, [])

  useEffect(() => { loadGoals() }, [loadGoals])

  // ── Derived stats ────────────────────────────────────────────────────────────
  const allMilestones   = goals.flatMap(g => g.milestones ?? [])
  const totalMilestones = allMilestones.length
  const doneMilestones  = allMilestones.filter(m => m.status === 'completed').length
  const overallProgress = totalMilestones ? Math.round((doneMilestones / totalMilestones) * 100) : 0

  // ─────────────────────────────────────────────────────────────────────────────
  // AI HANDLER
  // ─────────────────────────────────────────────────────────────────────────────
  async function handleGenerateAI() {
    if (!aiPrompt.trim() || generatingAI) return
    setGeneratingAI(true)
    
    try {
      // 1. Call AI Backend
      const res = await fetch(`${API_URL}/generate-roadmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt.trim(), days: aiDays })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed to generate roadmap from AI')

      const aiTasks = data.tasks
      const today = new Date()

      // 2. Create the Main Goal in DB
      const targetDateISO = new Date(today.getTime() + (aiDays * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
      const goalRes = await addCareerGoal({
        title: aiPrompt.trim(),
        description: `AI Generated Roadmap for ${aiDays} days`,
        category: 'backend', // Defaulting to backend, user can edit
        target_date: targetDateISO,
        priority: 10,
        status: 'active',
      })

      if (goalRes.error) throw new Error(goalRes.error)
      const newGoalId = (goalRes.data as CareerGoal).id

      // 3. Add all AI tasks as Milestones under this Goal
      let addedMilestones = 0
      for (let i = 0; i < aiTasks.length; i++) {
        const aiTask = aiTasks[i]
        const msDate = new Date(today)
        msDate.setDate(msDate.getDate() + i)
        
        await addMilestone({
          goal_id: newGoalId,
          title: aiTask.title,
          target_date: msDate.toISOString().split('T')[0],
          status: 'pending',
          resources: []
        })
        addedMilestones++
      }

      toast({ title: 'AI Magic Complete! ✨', description: `Added Goal and ${addedMilestones} milestones.` })
      setAiPrompt('')
      setShowAIForm(false)
      loadGoals() // Refresh the UI with new data

    } catch (error: any) {
      toast({ title: 'AI Generation Failed 🚨', description: error.message, variant: 'destructive' })
    } finally {
      setGeneratingAI(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // EXPORT HANDLER (UPDATED & CLEANED)
  // ─────────────────────────────────────────────────────────────────────────────
  async function handleExportRoadmap() {
    if (goals.length === 0 || exporting) {
      toast({ title: 'No goals to export!' })
      return;
    }
    setExporting(true);
    try {
      // 1. Sirf wahi data bhejenge jo Python ko chahiye (No extra Supabase fields)
      const cleanGoals = goals.map(g => ({
        title: g.title,
        status: g.status,
        description: g.description || null,
        milestones: (g.milestones || []).map(m => ({
          title: m.title,
          status: m.status
        }))
      }));

      // 2. Clean data ko API mein bhejna
      const response = await fetch(`${API_URL}/export-roadmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goals: cleanGoals }), 
      });

      if (!response.ok) throw new Error("Export route not found or server error");

      // 3. File Download Magic
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `My_Rise_Roadmap.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({ title: 'Roadmap Exported! 📄' });
    } catch (error) {
      console.error("Export error:", error);
      toast({ title: 'Export failed 🚨', description: "Check if backend has the new route.", variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GOAL HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────

  async function handleAddGoal() {
    if (!newGoal.title.trim() || addingGoal) return
    setAddingGoal(true)
    const { data, error } = await addCareerGoal({
      title: newGoal.title.trim(),
      description: newGoal.description.trim() || null,
      category: newGoal.category,
      target_date: newGoal.target_date || null,
      priority: newGoal.priority,
      status: 'pending',
    })
    if (error) {
      toast({ title: 'Failed to add goal', description: error, variant: 'destructive' })
    } else {
      setGoals(prev => [...prev, { ...(data as CareerGoal), milestones: [] }])
      setNewGoal(BLANK_GOAL)
      setShowAddGoal(false)
      toast({ title: 'Goal added 🎯' })
    }
    setAddingGoal(false)
  }

  function startEditGoal(goal: CareerGoal) {
    setEditGoalId(goal.id)
    setEditGoalForm({
      title: goal.title,
      description: goal.description ?? '',
      category: goal.category,
      target_date: goal.target_date ?? '',
      priority: goal.priority,
    })
    setShowAddGoal(false)
  }

  async function handleSaveGoal(id: string) {
    if (!editGoalForm.title.trim() || savingGoal) return
    setSavingGoal(true)
    const updates = {
      title: editGoalForm.title.trim(),
      description: editGoalForm.description.trim() || null,
      category: editGoalForm.category,
      target_date: editGoalForm.target_date || null,
      priority: editGoalForm.priority,
    }
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g))
    setEditGoalId(null)

    const { error } = await updateCareerGoal(id, updates)
    if (error) {
      toast({ title: 'Failed to save changes', description: error, variant: 'destructive' })
      loadGoals()
    } else {
      toast({ title: 'Goal updated ✅' })
    }
    setSavingGoal(false)
  }

  async function handleToggleGoalStatus(goal: CareerGoal) {
    const next = goal.status === 'pending' ? 'active'
      : goal.status === 'active' ? 'completed' : 'pending'
    setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, status: next } : g))
    const { error } = await updateCareerGoal(goal.id, { status: next })
    if (error) { toast({ title: 'Failed to update status', variant: 'destructive' }); loadGoals() }
    else toast({ title: `Marked as ${next}` })
  }

  async function handleDeleteGoal(id: string) {
    if (deletingGoal) return
    setDeletingGoal(true)
    setDeleteGoalId(null)
    setGoals(prev => prev.filter(g => g.id !== id))
    if (expanded === id) setExpanded(null)

    const { error } = await deleteCareerGoal(id)
    if (error) {
      toast({ title: 'Failed to delete goal', description: error, variant: 'destructive' })
      loadGoals()
    } else {
      toast({ title: 'Goal deleted' })
    }
    setDeletingGoal(false)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MILESTONE HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────

  async function handleAddMilestone(goalId: string) {
    const text = newMilestoneTitle[goalId]?.trim()
    if (!text || addingMilestone) return
    setAddingMilestone(goalId)
    const { data, error } = await addMilestone({
      goal_id: goalId, title: text, status: 'pending', resources: [],
    })
    if (error) {
      toast({ title: 'Failed to add milestone', variant: 'destructive' })
    } else {
      setGoals(prev => prev.map(g =>
        g.id === goalId
          ? { ...g, milestones: [...(g.milestones ?? []), data as CareerMilestone] }
          : g
      ))
      setNewMilestoneTitle(prev => ({ ...prev, [goalId]: '' }))
    }
    setAddingMilestone(null)
  }

  async function handleToggleMilestone(goalId: string, milestone: CareerMilestone) {
    const next = milestone.status === 'completed' ? 'pending' : 'completed'
    const updates = {
      status: next,
      completed_at: next === 'completed' ? new Date().toISOString().split('T')[0] : null,
    }
    setGoals(prev => prev.map(g =>
      g.id === goalId
        ? { ...g, milestones: (g.milestones ?? []).map(m => m.id === milestone.id ? { ...m, ...updates } as CareerMilestone : m) }
        : g
    ))
    const { error } = await updateMilestone(milestone.id, updates as Partial<CareerMilestone>)
    if (error) { toast({ title: 'Failed to update', variant: 'destructive' }); loadGoals() }
    else if (next === 'completed') toast({ title: '✅ Milestone completed!' })
  }

  function startEditMilestone(milestone: CareerMilestone) {
    setEditMilestoneId(milestone.id)
    setEditMilestoneForm({
      title: milestone.title,
      target_date: milestone.target_date ?? '',
    })
  }

  async function handleSaveMilestone(goalId: string, milestoneId: string) {
    if (!editMilestoneForm.title.trim() || savingMilestone) return
    setSavingMilestone(true)
    const updates = {
      title: editMilestoneForm.title.trim(),
      target_date: editMilestoneForm.target_date || null,
    }
    setGoals(prev => prev.map(g =>
      g.id === goalId
        ? { ...g, milestones: (g.milestones ?? []).map(m => m.id === milestoneId ? { ...m, ...updates } as CareerMilestone : m) }
        : g
    ))
    setEditMilestoneId(null)

    const { error } = await updateMilestone(milestoneId, updates as Partial<CareerMilestone>)
    if (error) {
      toast({ title: 'Failed to save milestone', description: error, variant: 'destructive' })
      loadGoals()
    } else {
      toast({ title: 'Milestone updated ✅' })
    }
    setSavingMilestone(false)
  }

  async function handleDeleteMilestone(goalId: string, milestoneId: string) {
    if (deletingMilestone) return
    setDeletingMilestone(true)
    setDeleteMilestoneId(null)
    setGoals(prev => prev.map(g =>
      g.id === goalId
        ? { ...g, milestones: (g.milestones ?? []).filter(m => m.id !== milestoneId) }
        : g
    ))
    const { error } = await deleteMilestone(milestoneId)
    if (error) {
      toast({ title: 'Failed to delete milestone', description: error, variant: 'destructive' })
      loadGoals()
    } else {
      toast({ title: 'Milestone deleted' })
    }
    setDeletingMilestone(false)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 w-full max-w-[1800px] mx-auto animate-slide-in">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">Career Roadmap 🗺️</h1>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-2">
            {goals.filter(g => g.status === 'active').length} active ·{' '}
            {goals.filter(g => g.status === 'completed').length} completed ·{' '}
            {goals.length} total goals
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" className="rounded-xl border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/5" onClick={loadGoals} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <Button onClick={handleExportRoadmap} disabled={exporting} className="rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold px-6 shadow-md gap-2">
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Map className="h-4 w-4" />}
            {exporting ? 'Exporting...' : 'Export .MD'}
          </Button>

          <Button onClick={() => { setShowAIForm(s => !s); setShowAddGoal(false); setEditGoalId(null) }} className="rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold px-6 shadow-md gap-2">
            <Sparkles className="h-4 w-4" /> Auto-Generate (AI)
          </Button>
          <Button onClick={() => { setShowAddGoal(s => !s); setShowAIForm(false); setEditGoalId(null) }} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 shadow-md gap-2">
            <Plus className="h-4 w-4" /> Add Goal
          </Button>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Overall Progress" value={`${overallProgress}%`} color="violet" icon={Map} />
        <StatCard title="Milestones Done" value={doneMilestones} color="emerald" icon={Flag} />
        <StatCard title="Active Goals" value={goals.filter(g => g.status === 'active').length} color="amber" icon={Zap} />
        <StatCard title="Total Goals" value={goals.length} color="blue" icon={Target} />
      </div>

      {/* ── Overall Progress Bar ── */}
      {totalMilestones > 0 && (
        <div className="glass-card p-6 md:p-8 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div>
              <p className="text-sm font-black uppercase tracking-widest text-indigo-500">Roadmap Progress</p>
              <p className="text-4xl font-black tracking-tighter text-slate-800 dark:text-slate-100 mt-1">{overallProgress}%</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end text-slate-600 dark:text-slate-300">
                <Flag className="h-5 w-5" />
                <p className="text-lg font-black">{doneMilestones}/{totalMilestones} Milestones</p>
              </div>
            </div>
          </div>
          <div className="relative z-10 h-3 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden border border-slate-200/50 dark:border-white/5">
             <div className="h-full transition-all duration-1000 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${overallProgress}%` }} />
          </div>
        </div>
      )}

      {/* ── AI Auto-Generate Form ── */}
      {showAIForm && (
        <div className="glass-card p-6 border-purple-200/50 dark:border-purple-500/20 bg-purple-50/30 dark:bg-purple-900/10 animate-fade-in space-y-6">
          <p className="text-lg font-black tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" /> AI Roadmap Generator
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="sm:col-span-2 space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">What do you want to learn? *</Label>
              <Input placeholder="e.g. Master Next.js Backend" className="rounded-xl font-bold h-11"
                value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGenerateAI()} />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Timeline (Days)</Label>
              <Input type="number" min={1} max={100} className="rounded-xl font-bold h-11"
                value={aiDays} onChange={e => setAiDays(parseInt(e.target.value) || 30)} />
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-purple-100 dark:border-purple-500/10">
            <Button onClick={handleGenerateAI} disabled={generatingAI} className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold h-10 px-8 shadow-md">
              {generatingAI ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
              {generatingAI ? 'Cooking Magic…' : 'Generate Tasks'}
            </Button>
            <Button variant="ghost" onClick={() => setShowAIForm(false)} className="rounded-xl font-bold h-10 text-slate-500">Cancel</Button>
          </div>
        </div>
      )}

      {/* ── Add Goal Form ── */}
      {showAddGoal && (
        <div className="glass-card p-6 border-indigo-200/50 dark:border-indigo-500/20 animate-fade-in space-y-6">
          <p className="text-lg font-black tracking-tight text-slate-800 dark:text-slate-100">Draft New Goal</p>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Goal Title *</Label>
              <Input placeholder="e.g. Master System Design" className="rounded-xl font-bold h-11"
                value={newGoal.title} onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && handleAddGoal()} />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</Label>
              <Input placeholder="What does completing this goal look like?" className="rounded-xl font-bold h-11"
                value={newGoal.description} onChange={e => setNewGoal({ ...newGoal, description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</Label>
              <select className="w-full h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 px-4 text-sm font-bold focus:outline-none focus:border-indigo-400 text-slate-700 dark:text-slate-200"
                value={newGoal.category}
                onChange={e => setNewGoal({ ...newGoal, category: e.target.value as CareerGoal['category'] })}>
                {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Date</Label>
              <Input type="date" className="rounded-xl font-bold h-11" value={newGoal.target_date}
                onChange={e => setNewGoal({ ...newGoal, target_date: e.target.value })} />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex justify-between">
                <span>Priority Priority</span>
                <span className="text-indigo-500">{newGoal.priority} / 10</span>
              </Label>
              <input type="range" min={1} max={10} value={newGoal.priority}
                onChange={e => setNewGoal({ ...newGoal, priority: parseInt(e.target.value) })}
                className="w-full accent-indigo-500 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer" />
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
            <Button onClick={handleAddGoal} disabled={addingGoal} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-8 shadow-md">
              {addingGoal ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              {addingGoal ? 'Saving…' : 'Add Goal'}
            </Button>
            <Button variant="ghost" onClick={() => setShowAddGoal(false)} className="rounded-xl font-bold h-10 text-slate-500">Cancel</Button>
          </div>
        </div>
      )}

      {/* ── Goal list ── */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-32 rounded-[2rem] shimmer" />)}
        </div>
      ) : goals.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-20 border-dashed border-2 text-slate-400">
          <Target className="h-12 w-12 mb-4 opacity-20" />
          <p className="text-lg font-black tracking-tight text-slate-700 dark:text-slate-200">No goals yet</p>
          <p className="text-sm font-bold mt-1 opacity-70">Click "Add Goal" to start building your roadmap</p>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal, idx) => {
            const isExpanded    = expanded === goal.id
            const isEditingGoal = editGoalId === goal.id
            const isDeletingGoal = deleteGoalId === goal.id
            const milestones    = goal.milestones ?? []
            const done          = milestones.filter(m => m.status === 'completed').length
            const progress      = milestones.length ? Math.round((done / milestones.length) * 100) : 0

            return (
              <div key={goal.id} className={cn(
                'glass-card group p-6 border transition-all duration-300',
                isExpanded ? 'ring-2 ring-indigo-500/20 shadow-lg' : 'hover:-translate-y-1',
                goal.status === 'completed' && 'bg-emerald-50/10 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/10'
              )}>
                {/* ── Goal: Edit mode ── */}
                {isEditingGoal ? (
                  <div className="space-y-6 animate-fade-in bg-slate-50/50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10" onClick={e => e.stopPropagation()}>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Edit Goal Details</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2 space-y-2"><Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Title *</Label>
                        <Input className="h-10 rounded-xl font-bold" value={editGoalForm.title} onChange={e => setEditGoalForm({ ...editGoalForm, title: e.target.value })} /></div>
                      <div className="sm:col-span-2 space-y-2"><Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description</Label>
                        <Input className="h-10 rounded-xl font-bold" placeholder="Optional description" value={editGoalForm.description} onChange={e => setEditGoalForm({ ...editGoalForm, description: e.target.value })} /></div>
                      <div className="space-y-2"><Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Category</Label>
                        <select className="w-full h-10 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 px-3 text-sm font-bold focus:outline-none focus:border-indigo-400 text-slate-700 dark:text-slate-200"
                          value={editGoalForm.category} onChange={e => setEditGoalForm({ ...editGoalForm, category: e.target.value as CareerGoal['category'] })}>
                          {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2"><Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target Date</Label>
                        <Input type="date" className="h-10 rounded-xl font-bold" value={editGoalForm.target_date} onChange={e => setEditGoalForm({ ...editGoalForm, target_date: e.target.value })} /></div>
                      <div className="sm:col-span-2 space-y-2">
                        <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Priority: {editGoalForm.priority}/10</Label>
                        <input type="range" min={1} max={10} value={editGoalForm.priority} onChange={e => setEditGoalForm({ ...editGoalForm, priority: parseInt(e.target.value) })} className="w-full accent-indigo-500 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
                      <Button size="sm" className="rounded-xl h-9 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-1.5" onClick={() => handleSaveGoal(goal.id)} disabled={savingGoal}>
                        {savingGoal ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                        {savingGoal ? 'Saving…' : 'Save Changes'}
                      </Button>
                      <Button size="sm" variant="ghost" className="rounded-xl h-9 text-slate-500 font-bold" onClick={() => setEditGoalId(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  /* ── Goal: View mode ── */
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-black text-xl shrink-0 border border-slate-200 dark:border-white/10 shadow-sm">
                      {idx + 1}
                    </div>

                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpanded(isExpanded ? null : goal.id)}>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-extrabold text-xl text-slate-800 dark:text-slate-100 tracking-tight">{goal.title}</h3>
                        <Badge className={cn('px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm', getCategoryColor(goal.category))}>
                          {CATEGORY_LABELS[goal.category]}
                        </Badge>
                        <button
                          onClick={e => { e.stopPropagation(); handleToggleGoalStatus(goal) }}
                          className={cn('px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm transition-all', STATUS_STYLES[goal.status])}>
                          {goal.status}
                        </button>
                      </div>
                      
                      {goal.description && <p className="text-[13px] font-bold text-slate-500 mt-2 line-clamp-2">{goal.description}</p>}
                      
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex-1 max-w-md h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden border border-slate-200/50 dark:border-white/5">
                          <div className={cn("h-full transition-all duration-1000 rounded-full", goal.status === 'completed' ? 'bg-emerald-400' : 'bg-indigo-500')} style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-sm font-black text-slate-400">{progress}%</span>
                        
                        {goal.target_date && (
                          <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-4 border-l border-slate-200 dark:border-white/10 pl-4">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(goal.target_date, 'MMM yyyy')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons (right side) */}
                    <div className="flex items-center justify-end shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-white/10 mt-4 md:mt-0">
                      {isDeletingGoal ? (
                        <ConfirmDelete 
                          message="Delete Goal?"
                          onConfirm={(e) => { e.stopPropagation(); handleDeleteGoal(goal.id); }} 
                          onCancel={(e) => { e.stopPropagation(); setDeleteGoalId(null); }} 
                        />
                      ) : (
                        <div className="flex md:flex-col items-center justify-end gap-2">
                          <div className="flex gap-2">
                            <button onClick={e => { e.stopPropagation(); startEditGoal(goal) }} className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all text-slate-400 hover:text-indigo-600 shadow-sm border border-slate-200/50 dark:border-white/5" title="Edit goal">
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button onClick={e => { e.stopPropagation(); setDeleteGoalId(goal.id) }} className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all text-slate-400 hover:text-rose-500 shadow-sm border border-slate-200/50 dark:border-white/5" title="Delete goal">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <button onClick={() => setExpanded(isExpanded ? null : goal.id)} className="ml-auto md:ml-0 p-2 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-all text-slate-400 shadow-sm border border-slate-200/50 dark:border-white/5">
                            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Milestones (expanded) ── */}
                {isExpanded && !isEditingGoal && (
                  <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/10 animate-fade-in" onClick={e => e.stopPropagation()}>
                    <div className="relative">
                      {/* Vertical timeline line */}
                      <div className="absolute left-[19px] top-4 bottom-8 w-1 bg-slate-100 dark:bg-white/5 rounded-full" />

                      <div className="space-y-4 pl-12">
                        {milestones.length === 0 && (
                          <p className="text-sm font-bold text-slate-400 py-2">No milestones yet. Break this goal into actionable steps.</p>
                        )}

                        {milestones.map(milestone => {
                          const isEditingMs  = editMilestoneId === milestone.id
                          const isDeletingMs = deleteMilestoneId === milestone.id

                          return (
                            <div key={milestone.id} className="relative group/ms">
                              {/* Timeline dot */}
                              <div
                                className={cn(
                                  'absolute -left-[35px] top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-[3px] flex items-center justify-center transition-all z-10',
                                  milestone.status === 'completed'
                                    ? 'bg-emerald-100 border-emerald-500 cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                                    : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 cursor-pointer hover:border-indigo-400'
                                )}
                                onClick={() => !isEditingMs && handleToggleMilestone(goal.id, milestone)}
                              />

                              {/* ── Milestone: Edit mode ── */}
                              {isEditingMs ? (
                                <div className="flex flex-col sm:flex-row gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-indigo-200 dark:border-indigo-500/30 animate-fade-in">
                                  <Input className="h-9 rounded-xl font-bold flex-1" placeholder="Milestone title" value={editMilestoneForm.title} onChange={e => setEditMilestoneForm({ ...editMilestoneForm, title: e.target.value })} onKeyDown={e => e.key === 'Enter' && handleSaveMilestone(goal.id, milestone.id)} autoFocus />
                                  <div className="flex gap-2">
                                    <Input type="date" className="h-9 rounded-xl font-bold w-36" value={editMilestoneForm.target_date} onChange={e => setEditMilestoneForm({ ...editMilestoneForm, target_date: e.target.value })} />
                                    <Button size="sm" className="h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold" onClick={() => handleSaveMilestone(goal.id, milestone.id)} disabled={savingMilestone}>
                                      {savingMilestone ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save'}
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-9 rounded-xl font-bold text-slate-500" onClick={() => setEditMilestoneId(null)}><X className="h-4 w-4" /></Button>
                                  </div>
                                </div>
                              ) : (
                                /* ── Milestone: View mode ── */
                                <div className={cn(
                                  'flex items-center justify-between gap-4 p-4 rounded-2xl border transition-all cursor-pointer',
                                  milestone.status === 'completed'
                                    ? 'bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20'
                                    : 'bg-white/40 dark:bg-white/5 border-slate-100 dark:border-white/5 hover:border-indigo-200 dark:hover:border-indigo-500/30'
                                )} onClick={() => handleToggleMilestone(goal.id, milestone)}>
                                  <div className="flex-1 min-w-0">
                                    <p className={cn('text-[15px] font-bold truncate transition-all', milestone.status === 'completed' ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200')}>
                                      {milestone.title}
                                    </p>
                                    {milestone.target_date && (
                                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1 flex items-center gap-1.5">
                                        <Calendar className="h-3 w-3" />
                                        {formatDate(milestone.target_date, 'MMM d, yyyy')}
                                      </p>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-1 opacity-0 group-hover/ms:opacity-100 transition-opacity shrink-0">
                                    <button title="Edit milestone" onClick={(e) => { e.stopPropagation(); startEditMilestone(milestone) }} className="p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-600 transition-all">
                                      <Edit3 className="h-4 w-4" />
                                    </button>
                                    <button title="Delete milestone" onClick={(e) => { e.stopPropagation(); setDeleteMilestoneId(milestone.id) }} className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-all">
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>

                                  {isDeletingMs && (
                                    <div className="absolute right-0 top-0 bottom-0 bg-background/95 backdrop-blur-sm rounded-2xl flex items-center pr-2">
                                      <ConfirmDelete message="Delete?" onConfirm={(e) => { e.stopPropagation(); handleDeleteMilestone(goal.id, milestone.id); }} onCancel={(e) => { e.stopPropagation(); setDeleteMilestoneId(null); }} />
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}

                        {/* Add milestone row */}
                        <div className="relative mt-6">
                          <div className="absolute -left-[33px] top-1/2 -translate-y-1/2 h-3 w-3 rounded-full border-2 border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 z-10" />
                          <div className="flex flex-col sm:flex-row gap-3">
                            <Input
                              placeholder="Add a milestone... (press Enter)"
                              className="h-12 rounded-xl font-bold flex-1"
                              value={newMilestoneTitle[goal.id] ?? ''}
                              onChange={e => setNewMilestoneTitle(prev => ({ ...prev, [goal.id]: e.target.value }))}
                              onKeyDown={e => e.key === 'Enter' && handleAddMilestone(goal.id)}
                            />
                            <Button className="h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 shadow-md"
                              onClick={() => handleAddMilestone(goal.id)}
                              disabled={addingMilestone === goal.id}>
                              {addingMilestone === goal.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Step'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}