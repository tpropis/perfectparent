import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  }).format(new Date(date))
}

export function formatTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date))
}

export function formatRelative(date: string | Date): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(date)
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getRoleColor(role: string): string {
  const colors: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-700',
    teacher: 'bg-blue-100 text-blue-700',
    coach: 'bg-green-100 text-green-700',
    parent: 'bg-orange-100 text-orange-700',
    student: 'bg-sky-100 text-sky-700',
  }
  return colors[role] ?? 'bg-gray-100 text-gray-700'
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    school: 'bg-blue-50 text-blue-700 border-blue-200',
    team: 'bg-green-50 text-green-700 border-green-200',
    class: 'bg-purple-50 text-purple-700 border-purple-200',
    urgent: 'bg-red-50 text-red-700 border-red-200',
    general: 'bg-gray-50 text-gray-700 border-gray-200',
    athletics: 'bg-green-50 text-green-700 border-green-200',
    academic: 'bg-purple-50 text-purple-700 border-purple-200',
    other: 'bg-gray-50 text-gray-700 border-gray-200',
  }
  return colors[category] ?? 'bg-gray-50 text-gray-700 border-gray-200'
}
