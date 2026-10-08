import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:     'bg-primary/10 text-primary border border-primary/20',
        secondary:   'bg-secondary text-secondary-foreground border border-border',
        destructive: 'bg-destructive/10 text-destructive border border-destructive/20',
        outline:     'border border-border text-foreground',
        success:     'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
        warning:     'bg-amber-100  text-amber-700  border border-amber-200  dark:bg-amber-900/30  dark:text-amber-400  dark:border-amber-800',
        error:       'bg-rose-100   text-rose-700   border border-rose-200   dark:bg-rose-900/30   dark:text-rose-400   dark:border-rose-800',
        info:        'bg-blue-100   text-blue-700   border border-blue-200   dark:bg-blue-900/30   dark:text-blue-400   dark:border-blue-800',
        violet:      'bg-violet-100 text-violet-700 border border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
