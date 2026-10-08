import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  color: 'violet' | 'blue' | 'emerald' | 'amber' | 'rose' | 'cyan'
  trend?: { value: number; label: string; positive?: boolean }
  className?: string
  onClick?: () => void
}

export function StatCard({ title, value, subtitle, icon: Icon, color, trend, className, onClick }: StatCardProps) {
  return (
    <div
      className={cn(
        // FIXED: Added 'group' to trigger nested animations, and explicit hover lift to force it to fly!
        'glass-card group p-5 relative overflow-hidden flex flex-col justify-between h-full cursor-default hover:-translate-y-2 transition-all duration-500',
        `stat-${color}`,
        onClick && 'cursor-pointer hover:border-primary/40',
        className
      )}
      onClick={onClick}
    >
      {/* Decorative Large Background Icon for Depth */}
      <div className={cn(
        // FIXED: Now 'group-hover:scale-125' will actually work because parent has 'group' class!
        "absolute -right-2 -bottom-4 opacity-10 transform scale-150 pointer-events-none transition-transform duration-500 group-hover:scale-125",
        `text-${color}-600 dark:text-${color}-400`
      )}>
        <Icon size={80} strokeWidth={1} />
      </div>

      <div className="flex justify-between items-start mb-4 relative z-10">
         <div className={cn(
          // FIXED: Changed hover:scale-110 to group-hover:scale-110 so it reacts when the card is hovered
          'flex h-10 w-10 items-center justify-center rounded-xl shadow-sm border border-white/60 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3',
          `icon-${color}`
        )}>
          <Icon className="h-5 w-5" strokeWidth={2.5} />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500/80 dark:text-slate-400/80 bg-white/40 dark:bg-black/20 px-2 py-1 rounded-md backdrop-blur-md">
          {title}
        </p>
      </div>

      <div className="relative z-10 mt-auto pt-2">
        <p className="text-4xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 transition-transform duration-300 group-hover:translate-x-1">
          {value}
        </p>
        {subtitle && <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
        
        {trend && (
          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-white/60 dark:bg-black/20 rounded-full border border-white/40 shadow-sm backdrop-blur-md">
            <span className={cn(
              "text-[10px] font-bold",
              trend.positive !== false ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            )}>
              {trend.positive !== false ? '↑' : '↓'} {Math.abs(trend.value)}
            </span>
            <span className="text-[10px] font-medium text-slate-500">{trend.label}</span>
          </div>
        )}
      </div>
    </div>
  )
}