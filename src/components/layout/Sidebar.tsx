'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  GraduationCap,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Calendar,
  Trophy,
  Users,
  BookOpen,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import type { Profile, UserRole } from '@/types'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  roles: UserRole[]
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'teacher', 'coach', 'parent', 'student'] },
  { label: 'Announcements', href: '/announcements', icon: Megaphone, roles: ['admin', 'teacher', 'coach', 'parent', 'student'] },
  { label: 'Messages', href: '/messages', icon: MessageSquare, roles: ['admin', 'teacher', 'coach', 'parent', 'student'] },
  { label: 'Calendar', href: '/calendar', icon: Calendar, roles: ['admin', 'teacher', 'coach', 'parent', 'student'] },
  { label: 'Athletics', href: '/athletics', icon: Trophy, roles: ['admin', 'teacher', 'coach', 'parent', 'student'] },
  { label: 'Students', href: '/students', icon: BookOpen, roles: ['admin', 'teacher', 'coach'] },
  { label: 'Admin', href: '/admin', icon: Settings, roles: ['admin'] },
]

interface SidebarProps {
  profile: Profile
  onSignOut: () => void
}

export function Sidebar({ profile, onSignOut }: SidebarProps) {
  const pathname = usePathname()

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(profile.role))

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-slate-900 text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-white text-sm leading-tight">SchoolOS</p>
          <p className="text-slate-400 text-xs">Westlake Academy</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition group',
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <Icon className={cn('w-4 h-4 flex-shrink-0', active ? 'text-white' : 'text-slate-400 group-hover:text-white')} />
              <span>{item.label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-70" />}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-slate-800 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {getInitials(profile.full_name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{profile.full_name}</p>
            <p className="text-xs text-slate-400 capitalize">{profile.role}</p>
          </div>
        </div>
        <button
          onClick={onSignOut}
          className="flex items-center gap-3 px-3 py-2 rounded-lg w-full text-slate-400 hover:text-white hover:bg-slate-800 transition text-sm"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
