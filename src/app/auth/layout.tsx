import { Zap, CheckCircle2, TrendingUp, BookOpen, Target } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex w-[460px] shrink-0 flex-col justify-between p-12 relative overflow-hidden border-r border-border bg-card">

        {/* Subtle dot pattern */}
        <div className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: 'radial-gradient(circle, hsl(var(--border)) 1.5px, transparent 1.5px)',
            backgroundSize: '28px 28px',
          }} />
        {/* Pastel orbs */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-30"
          style={{ background: 'hsl(var(--surface-violet))' }} />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-20"
          style={{ background: 'hsl(var(--surface-emerald))' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl icon-violet">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xl font-bold gradient-text tracking-tight">Rise</span>
            <p className="text-[11px] text-muted-foreground -mt-0.5">Personal OS for Builders</p>
          </div>
        </div>

        {/* Copy */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-bold leading-tight tracking-tight text-foreground">
              Build your career,
              <br />
              <span className="gradient-text">one day at a time.</span>
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed max-w-xs mt-4">
              Track goals, study smarter, manage tasks, and grow consistently — all in one clean workspace.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            {[
              { icon: TrendingUp,   text: 'Career roadmap with milestones',       color: 'icon-violet' },
              { icon: BookOpen,     text: 'Study tracker with exam countdown',    color: 'icon-emerald' },
              { icon: CheckCircle2, text: 'Daily tasks, Pomodoro & streaks',      color: 'icon-amber' },
              { icon: Target,       text: 'Resume builder with ATS export',       color: 'icon-blue' },
            ].map(({ icon: Icon, text, color }, i) => (
              <div key={text}
                className="flex items-center gap-3 text-sm text-muted-foreground animate-fade-in"
                style={{ animationDelay: `${i * 80}ms`, opacity: 0 }}>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span>{text}</span>
              </div>
            ))}
          </div>

          {/* Testimonial-style */}
          <div className="p-4 rounded-2xl bg-muted/60 border border-border">
            <p className="text-sm text-muted-foreground leading-relaxed italic">
              &ldquo;The only dashboard built for students who mean business.&rdquo;
            </p>
            <div className="flex items-center gap-2 mt-3">
              <div className="flex -space-x-2">
                {['V','A','K','S'].map((l, i) => (
                  <div key={i} className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-card icon-violet text-[9px] font-bold">
                    {l}
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">Trusted by students</p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-[11px] text-muted-foreground/50">
          Rise · Personal Productivity & Career OS
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl icon-violet">
              <Zap className="h-4 w-4" />
            </div>
            <span className="text-base font-bold gradient-text">Rise</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}