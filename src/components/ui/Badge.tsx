import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'school' | 'team' | 'class' | 'urgent' | 'general' | 'success' | 'warning'
  className?: string
}

const variantStyles = {
  default: 'bg-slate-100 text-slate-700',
  school: 'bg-blue-50 text-blue-700',
  team: 'bg-green-50 text-green-700',
  class: 'bg-purple-50 text-purple-700',
  urgent: 'bg-red-50 text-red-700',
  general: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', variantStyles[variant], className)}>
      {children}
    </span>
  )
}
