import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, BookOpen, Trophy, Megaphone, Calendar, Shield } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardBody } from '@/components/ui/Card'
import type { Profile } from '@/types'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile || (profile as Profile).role !== 'admin') redirect('/dashboard')

  const p = profile as Profile

  // Counts
  const [
    { count: userCount },
    { count: studentCount },
    { count: teamCount },
    { count: announcementCount },
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('school_id', p.school_id),
    supabase.from('students').select('id', { count: 'exact', head: true }).eq('school_id', p.school_id),
    supabase.from('teams').select('id', { count: 'exact', head: true }).eq('school_id', p.school_id),
    supabase.from('announcements').select('id', { count: 'exact', head: true }).eq('school_id', p.school_id),
  ])

  const sections = [
    { label: 'Users', count: userCount ?? 0, href: '/admin/users', icon: Users, color: 'bg-blue-500', description: 'Manage staff, parents, and accounts' },
    { label: 'Students', count: studentCount ?? 0, href: '/admin/students', icon: BookOpen, color: 'bg-purple-500', description: 'Student records and profiles' },
    { label: 'Teams', count: teamCount ?? 0, href: '/admin/teams', icon: Trophy, color: 'bg-green-500', description: 'Athletics teams and rosters' },
    { label: 'Announcements', count: announcementCount ?? 0, href: '/announcements', icon: Megaphone, color: 'bg-orange-500', description: 'School-wide communications' },
    { label: 'Events', count: '—', href: '/calendar', icon: Calendar, color: 'bg-sky-500', description: 'Calendar and scheduling' },
  ]

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Admin Panel"
        subtitle="Manage users, students, teams, and school settings"
      />

      <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-xl px-4 py-3">
        <Shield className="w-4 h-4 text-purple-600" />
        <p className="text-sm text-purple-700 font-medium">You are signed in as an administrator for Westlake Academy</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <Link key={section.href} href={section.href}>
              <Card hover className="h-full">
                <CardBody className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 ${section.color} rounded-xl flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-slate-900">{section.count}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{section.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{section.description}</p>
                  </div>
                </CardBody>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
