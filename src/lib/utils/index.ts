import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, differenceInDays } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | null, fmt = 'MMM d, yyyy'): string {
  if (!date) return 'N/A'
  return format(new Date(date), fmt)
}

export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function daysUntil(date: string | Date | null): number | null {
  if (!date) return null
  return differenceInDays(new Date(date), new Date())
}

export function minutesToHours(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'urgent': return 'text-rose-400 bg-rose-400/10 border-rose-400/20'
    case 'high': return 'text-amber-400 bg-amber-400/10 border-amber-400/20'
    case 'medium': return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
    case 'low': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
    default: return 'text-muted-foreground bg-muted border-border'
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'completed': return 'text-emerald-400 bg-emerald-400/10'
    case 'active':
    case 'in_progress': return 'text-blue-400 bg-blue-400/10'
    case 'missed': return 'text-rose-400 bg-rose-400/10'
    case 'pending': return 'text-amber-400 bg-amber-400/10'
    default: return 'text-muted-foreground bg-muted'
  }
}

export function getCategoryColor(category: string): string {
  const map: Record<string, string> = {
    dsa: 'text-violet-400 bg-violet-400/10',
    backend: 'text-blue-400 bg-blue-400/10',
    ai_ml: 'text-emerald-400 bg-emerald-400/10',
    project: 'text-amber-400 bg-amber-400/10',
    internship: 'text-rose-400 bg-rose-400/10',
    placement: 'text-orange-400 bg-orange-400/10',
    system_design: 'text-cyan-400 bg-cyan-400/10',
  }
  return map[category] || 'text-muted-foreground bg-muted'
}

export function generateInitials(name: string | null): string {
  if (!name) return 'U'
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function calculateProgress(items: { done: boolean }[]): number {
  if (!items.length) return 0
  return Math.round((items.filter(i => i.done).length / items.length) * 100)
}
