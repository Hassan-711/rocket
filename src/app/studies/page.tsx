'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  BookOpen, Plus, Calendar, ChevronDown, ChevronUp,
  CheckCircle2, Circle, Trash2, Trophy, AlertTriangle,
  FileText, Link2, Upload, File, X, Loader2,
  Presentation, ExternalLink, Download, Edit3,
  Check, Archive, GraduationCap, RefreshCw, Target
} from 'lucide-react'
import { cn, formatDate, daysUntil, getPriorityColor } from '@/lib/utils'
import { toast } from '@/components/ui/toaster'
import {
  getSubjects, addSubject, updateSubject, deleteSubject,
  getStudyMaterials, addStudyMaterial, deleteStudyMaterial, uploadMaterialFile
} from '@/lib/db'
import { createClient } from '@/lib/supabase/client'
import type { Subject, SyllabusTopic, StudyMaterial } from '@/lib/types'
import { StatCard } from '@/components/dashboard/StatCard'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6']

type SubjectStatus = 'current' | 'completed' | 'archived'
type FilterTab = 'current' | 'completed' | 'archived' | 'all'

const STATUS_CONFIG: Record<SubjectStatus, { label: string; color: string; icon: React.ReactNode }> = {
  current:   { label: 'Current',   color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20', icon: <BookOpen className="h-3 w-3" /> },
  completed: { label: 'Completed', color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20',         icon: <GraduationCap className="h-3 w-3" /> },
  archived:  { label: 'Archived',  color: 'text-slate-500 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10',          icon: <Archive className="h-3 w-3" /> },
}

const MATERIAL_ICONS: Record<string, React.ReactNode> = {
  pdf:   <FileText className="h-4 w-4 text-rose-500" />,
  ppt:   <Presentation className="h-4 w-4 text-amber-500" />,
  doc:   <FileText className="h-4 w-4 text-blue-500" />,
  link:  <Link2 className="h-4 w-4 text-emerald-500" />,
  note:  <FileText className="h-4 w-4 text-violet-500" />,
  other: <File className="h-4 w-4 text-slate-400" />,
}

function getMaterialType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'pdf') return 'pdf'
  if (['ppt', 'pptx'].includes(ext)) return 'ppt'
  if (['doc', 'docx', 'txt', 'md'].includes(ext)) return 'doc'
  return 'other'
}

function formatSize(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ─────────────────────────────────────────────────────────────────────────────
// Confirm Dialog (Sleek Inline Design)
// ─────────────────────────────────────────────────────────────────────────────
function ConfirmDelete({ onConfirm, onCancel, message = "Delete subject?" }: { onConfirm: (e: React.MouseEvent) => void; onCancel: (e: React.MouseEvent) => void; message?: string }) {
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
// Materials Panel
// ─────────────────────────────────────────────────────────────────────────────
function MaterialsPanel({ subject }: { subject: Subject }) {
  const [materials, setMaterials] = useState<StudyMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showLinkForm, setShowLinkForm] = useState(false)
  const [linkForm, setLinkForm] = useState({ name: '', url: '' })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const loadMaterials = useCallback(() => {
    setLoading(true)
    getStudyMaterials(subject.id).then(d => {
      setMaterials(d as StudyMaterial[])
      setLoading(false)
    })
  }, [subject.id])

  useEffect(() => { loadMaterials() }, [loadMaterials])

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast({ title: 'Not authenticated', variant: 'destructive' }); setUploading(false); return }

    const { url, error: uploadError } = await uploadMaterialFile(file, user.id, subject.id)
    if (uploadError || !url) {
      toast({ title: 'Upload failed', description: 'Make sure the "study-materials" bucket is set up in Supabase Storage.', variant: 'destructive' })
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    const { data, error } = await addStudyMaterial({
      subject_id: subject.id, name: file.name,
      type: getMaterialType(file.name), file_url: url, size_bytes: file.size,
    })
    if (error) {
      toast({ title: 'Failed to save file', variant: 'destructive' })
    } else {
      setMaterials(prev => [data as StudyMaterial, ...prev])
      toast({ title: `${file.name} uploaded ✅` })
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleAddLink() {
    if (!linkForm.name.trim() || !linkForm.url.trim()) {
      toast({ title: 'Name and URL are required', variant: 'destructive' }); return
    }
    const url = linkForm.url.startsWith('http') ? linkForm.url : `https://${linkForm.url}`
    const { data, error } = await addStudyMaterial({
      subject_id: subject.id, name: linkForm.name.trim(), type: 'link', external_url: url,
    })
    if (error) { toast({ title: 'Failed to save link', variant: 'destructive' }); return }
    setMaterials(prev => [data as StudyMaterial, ...prev])
    setLinkForm({ name: '', url: '' })
    setShowLinkForm(false)
    toast({ title: 'Link saved ✅' })
  }

  async function handleDelete(material: StudyMaterial) {
    setMaterials(prev => prev.filter(m => m.id !== material.id))
    if (material.file_url) {
      const path = material.file_url.split('/study-materials/')[1]
      if (path) await supabase.storage.from('study-materials').remove([path])
    }
    const { error } = await deleteStudyMaterial(material.id)
    if (error) { toast({ title: 'Failed to remove', variant: 'destructive' }); loadMaterials() }
    else toast({ title: 'Removed' })
  }

  return (
    <div className="space-y-4 pt-2" onClick={e => e.stopPropagation()}>
      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Library & Resources</p>
        <div className="flex gap-2">
          <input ref={fileInputRef} type="file" className="hidden"
            accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.md,.png,.jpg"
            onChange={handleFileUpload} />
          <Button size="sm" variant="ghost" className="h-8 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold gap-1.5"
            onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
            {uploading ? 'Uploading…' : 'Upload File'}
          </Button>
          <Button size="sm" variant="ghost" className="h-8 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold gap-1.5"
            onClick={() => setShowLinkForm(!showLinkForm)}>
            <Link2 className="h-3 w-3" /> Add Link
          </Button>
        </div>
      </div>

      {/* Link form */}
      {showLinkForm && (
        <div className="p-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-3 animate-fade-in shadow-inner">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input placeholder="Label (e.g. DBMS PYQ 2023)" className="h-10 rounded-xl font-bold"
              value={linkForm.name} onChange={e => setLinkForm({ ...linkForm, name: e.target.value })} />
            <Input placeholder="URL (YouTube, Drive, etc.)" className="h-10 rounded-xl font-bold"
              value={linkForm.url} onChange={e => setLinkForm({ ...linkForm, url: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleAddLink()} />
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-9 px-4" onClick={handleAddLink}>Save Link</Button>
            <Button size="sm" variant="ghost" className="rounded-xl font-bold h-9 text-slate-500" onClick={() => setShowLinkForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-3">
          {[1,2].map(i => <div key={i} className="h-16 rounded-2xl shimmer" />)}
        </div>
      ) : materials.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl text-slate-400">
          <File className="h-8 w-8 mx-auto mb-2 opacity-20" />
          <p className="text-sm font-bold">No materials yet</p>
          <p className="text-xs mt-1 opacity-70">Upload PDFs, PPTs, notes or add links</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {materials.map(m => (
            <div key={m.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white/40 dark:bg-white/5 border border-slate-100 dark:border-white/5 group hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                {MATERIAL_ICONS[m.type] ?? MATERIAL_ICONS.other}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{m.name}</p>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {m.type}{m.size_bytes ? ` · ${formatSize(m.size_bytes)}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {(m.file_url || m.external_url) && (
                  <a href={m.file_url ?? m.external_url ?? '#'} target="_blank" rel="noreferrer"
                    className="p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-600 transition-colors">
                    {m.type === 'link' ? <ExternalLink className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                  </a>
                )}
                <button onClick={() => handleDelete(m)}
                  className="opacity-0 group-hover:opacity-100 p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-all">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Studies Page
// ─────────────────────────────────────────────────────────────────────────────
export default function StudiesPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [filterTab, setFilterTab] = useState<FilterTab>('current')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [innerTab, setInnerTab] = useState<Record<string, 'topics' | 'materials'>>({})
  
  // Subject States
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [addSaving, setAddSaving] = useState(false)
  const [newSubject, setNewSubject] = useState({
    name: '', code: '', credits: 3, exam_date: '', priority: 'medium' as Subject['priority'],
  })

  // Edit Subject State
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    name: '', code: '', credits: 3, exam_date: '', priority: 'medium' as Subject['priority'],
    status: 'current' as SubjectStatus,
  })
  const [editSaving, setEditSaving] = useState(false)

  // Topic States
  const [newTopic, setNewTopic] = useState<Record<string, string>>({})
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null)
  const [editTopicText, setEditTopicText] = useState('')
  const [confirmTopicDeleteId, setConfirmTopicDeleteId] = useState<string | null>(null)

  // ── Load subjects fresh from DB ─────────────────────────────────────────────
  const loadSubjects = useCallback(() => {
    setLoading(true)
    getSubjects()
      .then(d => { setSubjects(d as Subject[]); setLoading(false) })
      .catch(() => { toast({ title: 'Failed to load subjects', variant: 'destructive' }); setLoading(false) })
  }, [])

  useEffect(() => { loadSubjects() }, [loadSubjects])

  // ── Derived ─────────────────────────────────────────────────────────────────
  const currentSubjects  = subjects.filter(s => (s as Subject & { status?: string }).status === 'current'   || !(s as Subject & { status?: string }).status)
  const completedSubjects = subjects.filter(s => (s as Subject & { status?: string }).status === 'completed')
  const archivedSubjects  = subjects.filter(s => (s as Subject & { status?: string }).status === 'archived')

  const filteredSubjects = filterTab === 'all'       ? subjects
    : filterTab === 'current'   ? currentSubjects
    : filterTab === 'completed' ? completedSubjects
    : archivedSubjects

  const overallProgress = currentSubjects.length
    ? Math.round(currentSubjects.reduce((s, sub) => s + sub.progress, 0) / currentSubjects.length) : 0

  // ── ADD SUBJECT ─────────────────────────────────────────────────────────────
  async function handleAddSubject() {
    if (!newSubject.name.trim()) {
      toast({ title: 'Subject name is required', variant: 'destructive' }); return
    }
    if (addSaving) return
    setAddSaving(true)

    const color = COLORS[subjects.length % COLORS.length]
    const payload = {
      name: newSubject.name.trim(),
      code: newSubject.code.trim() || null,
      credits: newSubject.credits,
      exam_date: newSubject.exam_date || null,
      priority: newSubject.priority,
      progress: 0,
      syllabus_topics: [],
      color,
      semester_id: null,
    }

    const { data, error } = await addSubject(payload)

    if (error) {
      toast({ title: 'Failed to add subject', description: error, variant: 'destructive' })
      setAddSaving(false)
      return
    }

    if (data) {
      await updateSubject((data as Subject).id, { status: 'current' } as Partial<Subject>)
    }

    await loadSubjects()
    setNewSubject({ name: '', code: '', credits: 3, exam_date: '', priority: 'medium' })
    setShowAdd(false)
    toast({ title: `${(data as Subject).name} added 📚` })
    setAddSaving(false)
  }

  // ── DELETE SUBJECT ──────────────────────────────────────────────────────────
  async function handleDeleteSubject(id: string) {
    setConfirmDelete(null)
    setSubjects(prev => prev.filter(s => s.id !== id))
    if (expanded === id) setExpanded(null)

    const { error } = await deleteSubject(id)
    if (error) {
      toast({ title: 'Failed to delete subject', description: error, variant: 'destructive' })
      loadSubjects()
    } else {
      toast({ title: 'Subject deleted ✅' })
    }
  }

  // ── EDIT SUBJECT ────────────────────────────────────────────────────────────
  function startEdit(subject: Subject & { status?: string }) {
    setEditingId(subject.id)
    setEditForm({
      name: subject.name,
      code: subject.code ?? '',
      credits: subject.credits,
      exam_date: subject.exam_date ?? '',
      priority: subject.priority,
      status: (subject.status as SubjectStatus) ?? 'current',
    })
  }

  function cancelEdit() { setEditingId(null) }

  async function handleSaveEdit(id: string) {
    if (!editForm.name.trim()) {
      toast({ title: 'Subject name is required', variant: 'destructive' }); return
    }
    setEditSaving(true)

    const updates = {
      name: editForm.name.trim(),
      code: editForm.code.trim() || null,
      credits: editForm.credits,
      exam_date: editForm.exam_date || null,
      priority: editForm.priority,
      status: editForm.status,
    }

    setSubjects(prev => prev.map(s => s.id === id ? { ...s, ...updates } as Subject : s))
    setEditingId(null)

    const { error } = await updateSubject(id, updates as Partial<Subject>)
    if (error) {
      toast({ title: 'Failed to save changes', description: error, variant: 'destructive' })
      loadSubjects()
    } else {
      toast({ title: 'Subject updated ✅' })
    }
    setEditSaving(false)
  }

  // ── STATUS CHANGE (quick) ───────────────────────────────────────────────────
  async function handleStatusChange(subject: Subject, newStatus: SubjectStatus) {
    setSubjects(prev => prev.map(s => s.id === subject.id ? { ...s, status: newStatus } as Subject : s))
    const { error } = await updateSubject(subject.id, { status: newStatus } as Partial<Subject>)
    if (error) {
      toast({ title: 'Failed to update status', variant: 'destructive' })
      loadSubjects()
    } else {
      toast({ title: `Marked as ${STATUS_CONFIG[newStatus].label} ✅` })
    }
  }

  // ── TOPIC HANDLERS ──────────────────────────────────────────────────────────
  async function handleAddTopic(subject: Subject) {
    const text = newTopic[subject.id]?.trim()
    if (!text) return
    const updated: SyllabusTopic[] = [
      ...subject.syllabus_topics,
      { id: Date.now().toString(), topic: text, done: false },
    ]
    const newProgress = Math.round(updated.filter(t => t.done).length / updated.length * 100)
    setSubjects(prev => prev.map(s => s.id === subject.id ? { ...s, syllabus_topics: updated, progress: newProgress } : s))
    setNewTopic(prev => ({ ...prev, [subject.id]: '' }))
    const { error } = await updateSubject(subject.id, { syllabus_topics: updated, progress: newProgress })
    if (error) { toast({ title: 'Failed to save topic', variant: 'destructive' }); loadSubjects() }
  }

  async function handleToggleTopic(subject: Subject, topicId: string) {
    const updated = subject.syllabus_topics.map(t => t.id === topicId ? { ...t, done: !t.done } : t)
    const newProgress = updated.length ? Math.round(updated.filter(t => t.done).length / updated.length * 100) : 0
    setSubjects(prev => prev.map(s => s.id === subject.id ? { ...s, syllabus_topics: updated, progress: newProgress } : s))
    await updateSubject(subject.id, { syllabus_topics: updated, progress: newProgress })
  }

  async function handleSaveEditTopic(subject: Subject, topicId: string) {
    if (!editTopicText.trim()) return;
    const updated = subject.syllabus_topics.map(t => t.id === topicId ? { ...t, topic: editTopicText.trim() } : t);
    const newProgress = updated.length ? Math.round(updated.filter(t => t.done).length / updated.length * 100) : 0;
    setSubjects(prev => prev.map(s => s.id === subject.id ? { ...s, syllabus_topics: updated, progress: newProgress } : s));
    setEditingTopicId(null);
    await updateSubject(subject.id, { syllabus_topics: updated, progress: newProgress });
    toast({ title: 'Topic updated' });
  }

  async function handleDeleteTopic(subject: Subject, topicId: string) {
    const updated = subject.syllabus_topics.filter(t => t.id !== topicId)
    const newProgress = updated.length ? Math.round(updated.filter(t => t.done).length / updated.length * 100) : 0
    setSubjects(prev => prev.map(s => s.id === subject.id ? { ...s, syllabus_topics: updated, progress: newProgress } : s))
    await updateSubject(subject.id, { syllabus_topics: updated, progress: newProgress })
    toast({ title: 'Topic deleted' });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 w-full max-w-[1800px] mx-auto animate-slide-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">Study Dashboard 🎓</h1>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-2">
            {currentSubjects.length} current · {completedSubjects.length} completed · {archivedSubjects.length} archived
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" className="rounded-xl border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/5" onClick={loadSubjects} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => { setShowAdd(!showAdd); setEditingId(null) }} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 shadow-md gap-2">
            <Plus className="h-4 w-4" /> Add Subject
          </Button>
        </div>
      </div>

      {/* ── 4 STAT CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Overall Progress" value={`${overallProgress}%`} color="violet" icon={Target} />
        <StatCard title="Current Subjects" value={currentSubjects.length} color="emerald" icon={BookOpen} />
        <StatCard title="Exams Ahead" value={currentSubjects.filter(s => s.exam_date && daysUntil(s.exam_date)! <= 15 && daysUntil(s.exam_date)! >= 0).length} color="rose" icon={AlertTriangle} />
        <StatCard title="Total Credits" value={currentSubjects.reduce((acc, s) => acc + s.credits, 0)} color="amber" icon={Trophy} />
      </div>

      {/* Add Subject Form */}
      {showAdd && (
        <div className="glass-card p-6 border-indigo-200/50 dark:border-indigo-500/20 animate-fade-in space-y-6">
          <p className="text-lg font-black tracking-tight text-slate-800 dark:text-slate-100">Add New Subject</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subject Name *</Label>
              <Input placeholder="e.g. Database Systems" className="rounded-xl font-bold"
                value={newSubject.name} onChange={e => setNewSubject({ ...newSubject, name: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && handleAddSubject()} />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Code</Label>
              <Input placeholder="CSE301" className="rounded-xl font-bold"
                value={newSubject.code} onChange={e => setNewSubject({ ...newSubject, code: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Credits</Label>
              <Input type="number" min={1} max={6} className="rounded-xl font-bold" value={newSubject.credits}
                onChange={e => setNewSubject({ ...newSubject, credits: parseInt(e.target.value) || 3 })} />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Exam Date</Label>
              <Input type="date" className="rounded-xl font-bold" value={newSubject.exam_date}
                onChange={e => setNewSubject({ ...newSubject, exam_date: e.target.value })} />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-4 border-t border-slate-100 dark:border-white/5">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Priority</Label>
              <div className="flex gap-2">
                {(['high', 'medium', 'low'] as const).map(p => (
                  <button key={p} onClick={() => setNewSubject({ ...newSubject, priority: p })}
                    className={cn('px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all',
                      newSubject.priority === p ? getPriorityColor(p) : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400')}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleAddSubject} disabled={addSaving} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-8">
                {addSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                {addSaving ? 'Saving…' : 'Add Subject'}
              </Button>
              <Button variant="ghost" onClick={() => setShowAdd(false)} className="rounded-xl font-bold h-10 text-slate-500">Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 p-1.5 rounded-2xl bg-white/40 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 w-fit backdrop-blur-md overflow-x-auto scrollbar-hide">
        {([
          { key: 'current',   label: `Current (${currentSubjects.length})` },
          { key: 'completed', label: `Completed (${completedSubjects.length})` },
          { key: 'archived',  label: `Archived (${archivedSubjects.length})` },
          { key: 'all',       label: `All (${subjects.length})` },
        ] as { key: FilterTab; label: string }[]).map(({ key, label }) => (
          <button key={key} onClick={() => setFilterTab(key)}
            className={cn('px-6 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all whitespace-nowrap',
              filterTab === key ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-md border border-slate-200/50 dark:border-white/10' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200')}>
            {label}
          </button>
        ))}
      </div>

      {/* Subject list */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-32 rounded-[2rem] shimmer" />)}
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-20 border-dashed border-2 text-slate-400">
          <BookOpen className="h-12 w-12 mb-4 opacity-20" />
          <p className="text-lg font-black tracking-tight text-slate-700 dark:text-slate-200">
            {filterTab === 'all' ? 'No subjects yet' : `No ${filterTab} subjects`}
          </p>
          <p className="text-sm font-bold mt-1 opacity-70">
            {filterTab === 'all' ? 'Click "Add Subject" to start tracking' : 'Change the filter above to see other subjects'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubjects.map(subject => {
            const sub = subject as Subject & { status?: SubjectStatus }
            const subStatus: SubjectStatus = sub.status ?? 'current'
            const isExpanded = expanded === sub.id
            const isEditing = editingId === sub.id
            const isConfirmingDelete = confirmDelete === sub.id
            const days = daysUntil(sub.exam_date)
            const doneTasks = sub.syllabus_topics.filter(t => t.done).length
            const isUrgent = days !== null && days >= 0 && days <= 7
            const currentInnerTab = innerTab[sub.id] ?? 'topics'

            return (
              <div key={sub.id} className={cn(
                'glass-card group p-6 border transition-all duration-300',
                isExpanded ? 'ring-2 ring-indigo-500/20 shadow-lg' : 'hover:-translate-y-1',
                subStatus === 'archived' && 'opacity-60 grayscale-[50%]'
              )}>
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Color bar */}
                  <div className="h-14 w-1.5 rounded-full shrink-0 mt-1 hidden md:block" style={{ background: sub.color }} />

                  <div className="flex-1 min-w-0">
                    {/* ── EDIT MODE ── */}
                    {isEditing ? (
                      <div className="space-y-6 animate-fade-in bg-slate-50/50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10" onClick={e => e.stopPropagation()}>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Edit Subject Details</p>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2"><Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Name *</Label>
                            <Input className="h-10 rounded-xl font-bold" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} /></div>
                          <div className="space-y-2"><Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Code</Label>
                            <Input className="h-10 rounded-xl font-bold" placeholder="CSE301" value={editForm.code} onChange={e => setEditForm({ ...editForm, code: e.target.value })} /></div>
                          <div className="space-y-2"><Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Credits</Label>
                            <Input type="number" min={1} max={6} className="h-10 rounded-xl font-bold" value={editForm.credits} onChange={e => setEditForm({ ...editForm, credits: parseInt(e.target.value) || 3 })} /></div>
                          <div className="space-y-2"><Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Exam Date</Label>
                            <Input type="date" className="h-10 rounded-xl font-bold" value={editForm.exam_date} onChange={e => setEditForm({ ...editForm, exam_date: e.target.value })} /></div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-6">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Priority</Label>
                            <div className="flex gap-2">
                              {(['high','medium','low'] as const).map(p => (
                                <button key={p} onClick={() => setEditForm({ ...editForm, priority: p })}
                                  className={cn('px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all',
                                    editForm.priority === p ? getPriorityColor(p) : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400')}>
                                  {p}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</Label>
                            <div className="flex gap-2">
                              {(['current','completed','archived'] as SubjectStatus[]).map(st => (
                                <button key={st} onClick={() => setEditForm({ ...editForm, status: st })}
                                  className={cn('px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all',
                                    editForm.status === st ? STATUS_CONFIG[st].color : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400')}>
                                  {STATUS_CONFIG[st].label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
                          <Button size="sm" className="rounded-xl h-9 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-1.5" onClick={() => handleSaveEdit(sub.id)} disabled={editSaving}>
                            {editSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                            {editSaving ? 'Saving…' : 'Save Changes'}
                          </Button>
                          <Button size="sm" variant="ghost" className="rounded-xl h-9 text-slate-500 font-bold" onClick={cancelEdit}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      /* ── VIEW MODE ── */
                      <div className="flex flex-col h-full justify-between gap-4">
                        <div className="flex items-center gap-3 flex-wrap cursor-pointer" onClick={() => setExpanded(isExpanded ? null : sub.id)}>
                          <div className="h-4 w-1.5 rounded-full md:hidden" style={{ background: sub.color }} />
                          <h3 className="font-extrabold text-xl text-slate-800 dark:text-slate-100 tracking-tight">{sub.name}</h3>
                          {sub.code && <span className="text-sm font-bold text-slate-400">{sub.code}</span>}
                          <Badge className={cn('px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm', STATUS_CONFIG[subStatus].color)}>
                            {STATUS_CONFIG[subStatus].label}
                          </Badge>
                          <Badge className={cn('px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm', getPriorityColor(sub.priority))}>{sub.priority}</Badge>
                          {isUrgent && subStatus === 'current' && (
                            <Badge className="bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border-rose-200 text-[9px] font-black uppercase tracking-widest gap-1">
                              <AlertTriangle className="h-3 w-3" />{days}d left
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 cursor-pointer" onClick={() => setExpanded(isExpanded ? null : sub.id)}>
                          <div className="flex-1 max-w-md h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden border border-slate-200/50 dark:border-white/5">
                            <div className="h-full transition-all duration-1000 rounded-full" style={{ width: `${sub.progress}%`, background: sub.color }} />
                          </div>
                          <span className="text-sm font-black text-slate-400">{sub.progress}%</span>
                        </div>
                        
                        <div className="flex items-center gap-6 text-[11px] font-bold text-slate-400 cursor-pointer uppercase tracking-widest" onClick={() => setExpanded(isExpanded ? null : sub.id)}>
                          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" />{doneTasks}/{sub.syllabus_topics.length} topics</span>
                          {sub.exam_date && <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{formatDate(sub.exam_date)}</span>}
                          <span className="flex items-center gap-1.5"><Trophy className="h-4 w-4" />{sub.credits} cr</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action buttons (right side) */}
                  {!isEditing && (
                    <div className="flex items-center justify-end shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-white/10 mt-4 md:mt-0">
                      {isConfirmingDelete ? (
                        <ConfirmDelete 
                          message="Delete this subject?"
                          onConfirm={(e) => { e.stopPropagation(); handleDeleteSubject(sub.id); }} 
                          onCancel={(e) => { e.stopPropagation(); setConfirmDelete(null); }} 
                        />
                      ) : (
                        <div className="flex md:flex-col items-center justify-end gap-2">
                          <div className="flex gap-2">
                            {/* Quick status cycle */}
                            <div className="relative group/status">
                              <button title="Change status" className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-all text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 shadow-sm border border-slate-200/50 dark:border-white/5" onClick={e => e.stopPropagation()}>
                                 {STATUS_CONFIG[subStatus].icon}
                              </button>
                              {/* Dropdown on hover */}
                              <div className="absolute right-0 top-full mt-2 z-20 hidden group-hover/status:flex flex-col gap-1 glass-card p-1.5 min-w-[140px]">
                                {(['current','completed','archived'] as SubjectStatus[]).map(st => (
                                  <button key={st} onClick={e => { e.stopPropagation(); handleStatusChange(sub, st) }}
                                    className={cn('flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all w-full text-left',
                                      subStatus === st ? STATUS_CONFIG[st].color : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-slate-200')}>
                                    {STATUS_CONFIG[st].icon}
                                    {STATUS_CONFIG[st].label}
                                    {subStatus === st && <Check className="h-3 w-3 ml-auto" />}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <button onClick={e => { e.stopPropagation(); startEdit(sub) }} className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all text-slate-400 hover:text-indigo-600 shadow-sm border border-slate-200/50 dark:border-white/5" title="Edit subject">
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button onClick={e => { e.stopPropagation(); setConfirmDelete(sub.id) }} className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all text-slate-400 hover:text-rose-500 shadow-sm border border-slate-200/50 dark:border-white/5" title="Delete subject">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <button onClick={() => setExpanded(isExpanded ? null : sub.id)} className="ml-auto md:ml-0 p-2 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-all text-slate-400 shadow-sm border border-slate-200/50 dark:border-white/5">
                            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Expanded content */}
                {isExpanded && !isEditing && (
                  <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/10 animate-fade-in" onClick={e => e.stopPropagation()}>
                    <div className="space-y-6">
                      {/* Inner tab switcher */}
                      <div className="flex gap-2 p-1.5 bg-slate-50/50 dark:bg-white/5 rounded-2xl w-fit border border-slate-200/50 dark:border-white/5 shadow-inner">
                        {(['topics', 'materials'] as const).map(t => (
                          <button key={t} onClick={(e) => { e.stopPropagation(); setInnerTab(prev => ({ ...prev, [sub.id]: t })) }}
                            className={cn('px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all',
                              currentInnerTab === t ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-md border border-slate-200/50 dark:border-white/10' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200')}>
                            {t === 'topics' ? `📋 Topics (${sub.syllabus_topics.length})` : '📁 Materials'}
                          </button>
                        ))}
                      </div>

                      {/* Topics */}
                      {currentInnerTab === 'topics' && (
                        <div className="space-y-2">
                          {sub.syllabus_topics.length === 0 && (
                            <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl text-slate-400">
                              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-20" />
                              <p className="text-sm font-bold">No topics yet</p>
                            </div>
                          )}
                          <div className="grid sm:grid-cols-2 gap-3">
                            {sub.syllabus_topics.map(topic => {
                              const isEditingTopic = editingTopicId === topic.id;
                              const isConfirmingTopicDel = confirmTopicDeleteId === topic.id;

                              // ── TOPIC EDIT MODE ──
                              if (isEditingTopic) {
                                return (
                                  <div key={topic.id} className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-indigo-200 dark:border-indigo-500/30" onClick={e => e.stopPropagation()}>
                                    <Input value={editTopicText} onChange={e => setEditTopicText(e.target.value)} className="h-9 rounded-xl font-bold flex-1" onKeyDown={e => e.key === 'Enter' && handleSaveEditTopic(sub, topic.id)} />
                                    <Button size="sm" className="h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold" onClick={(e) => { e.stopPropagation(); handleSaveEditTopic(sub, topic.id); }}>Save</Button>
                                    <Button size="sm" variant="ghost" className="h-9 rounded-xl font-bold text-slate-500" onClick={(e) => { e.stopPropagation(); setEditingTopicId(null); }}>Cancel</Button>
                                  </div>
                                )
                              }

                              // ── TOPIC DELETE CONFIRMATION ──
                              if (isConfirmingTopicDel) {
                                 return (
                                  <div key={topic.id} className="flex items-center gap-3 p-3 rounded-2xl bg-rose-50/50 dark:bg-rose-500/5 border border-rose-200 dark:border-rose-500/20 relative z-50 cursor-default" onClick={e => { e.preventDefault(); e.stopPropagation(); }}>
                                    <p className="text-[13px] font-bold text-rose-600 dark:text-rose-400 flex-1 truncate">Delete "{topic.topic}"?</p>
                                    <Button type="button" size="sm" className="h-8 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold px-3" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteTopic(sub, topic.id); setConfirmTopicDeleteId(null); }}>Yes</Button>
                                    <Button type="button" size="sm" variant="ghost" className="h-8 rounded-lg font-bold text-slate-500" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirmTopicDeleteId(null); }}>Cancel</Button>
                                  </div>
                                 )
                              }

                              // ── TOPIC NORMAL MODE ──
                             // ── TOPIC NORMAL MODE ──
                              return (
                                <div key={topic.id}
                                  className={cn('flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer group/t',
                                    topic.done ? 'bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20' : 'bg-white/40 dark:bg-white/5 border-slate-100 dark:border-white/5 hover:border-indigo-200 dark:hover:border-indigo-500/30')}
                                  onClick={(e) => { e.stopPropagation(); handleToggleTopic(sub, topic.id) }}>
                                  {topic.done
                                    ? <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                                    : <Circle className="h-5 w-5 text-slate-300 shrink-0" />}
                                  {/* YAHAN FIX KIYA HAI: Added explicit colors for both normal and done states */}
                                  <span className={cn('text-[14px] font-bold flex-1', topic.done ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200')}>
                                    {topic.topic}
                                  </span>
                                  <div className="flex gap-1 opacity-0 group-hover/t:opacity-100 transition-all shrink-0">
                                    <button onClick={e => { e.stopPropagation(); setEditingTopicId(topic.id); setEditTopicText(topic.topic); }}
                                      className="p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-600 transition-all">
                                      <Edit3 className="h-4 w-4" />
                                    </button>
                                    <button onClick={e => { e.stopPropagation(); setConfirmTopicDeleteId(topic.id); }}
                                      className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-all">
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                          <div className="flex flex-col sm:flex-row gap-3 mt-6">
                            <Input
                              placeholder="Add topic (e.g. Unit 3 — Normalization)…"
                              className="h-12 rounded-xl font-bold flex-1"
                              value={newTopic[sub.id] ?? ''}
                              onChange={e => setNewTopic(prev => ({ ...prev, [sub.id]: e.target.value }))}
                              onKeyDown={e => e.key === 'Enter' && handleAddTopic(sub)}
                            />
                            <Button className="h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 shadow-md" onClick={() => handleAddTopic(sub)}>Add Topic</Button>
                          </div>
                        </div>
                      )}

                      {/* Materials */}
                      {currentInnerTab === 'materials' && <MaterialsPanel subject={sub} />}
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