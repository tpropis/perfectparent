'use client'

import { GraduationCap, Bell, Menu } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import type { Profile } from '@/types'

interface TopBarProps {
  profile: Profile
  title?: string
}

export function TopBar({ profile, title }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-slate-200 px-4 py-3 flex items-center gap-3 md:hidden">
      <div className="flex items-center gap-2 flex-1">
        <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
          <GraduationCap className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-slate-800 text-sm">{title ?? 'SchoolOS'}</span>
      </div>
      <button className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition relative">
        <Bell className="w-4 h-4" />
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
      </button>
      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
        {getInitials(profile.full_name)}
      </div>
    </header>
  )
}
