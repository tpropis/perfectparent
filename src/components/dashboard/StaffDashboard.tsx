import Link from 'next/link'
import { Users, Megaphone, Calendar, Trophy, Plus, ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { PageHeader } from '@/components/ui/PageHeader'
import { formatTime, formatRelative } from '@/lib/utils'
import type { Profile, Announcement, Event } from '@/types'

interface StaffDashboardProps {
  profile: Profile
  announcements: Announcement[]
  events: Event[]
  studentCount: number
}

export function StaffDashboard({ profile, announcements, events, studentCount }: StaffDashboardProps) {
  const firstName = profile.full_name.split(' ')[0]

  const stats = [
    { label: 'Students', value: studentCount, icon: Users, href: '/students', color: 'bg-blue-500' },
    { label: 'Announcements', value: announcements.length, icon: Megaphone, href: '/announcements', color: 'bg-purple-500' },
    { label: 'Upcoming Events', value: events.length, icon: Calendar, href: '/calendar', color: 'bg-green-500' },
    { label: 'Athletics', value: '—', icon: Trophy, href: '/athletics', color: 'bg-orange-500' },
  ]

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title={`Welcome back, ${firstName}`}
        subtitle={`${profile.role.charAt(0).toUpperCase() + profile.role.slice(1)} · Westlake Academy`}
        action={
          profile.role !== 'student' ? (
            <Link
              href="/announcements/new"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
            >
              <Plus className="w-4 h-4" />
              New Announcement
            </Link>
          ) : undefined
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.label} href={stat.href}>
              <Card hover className="h-full">
                <CardBody className="flex items-center gap-3 p-4">
                  <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-xs text-slate-500">{stat.label}</p>
                  </div>
                </CardBody>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Announcements */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <span className="font-semibold text-slate-800 text-sm">Recent Announcements</span>
            <Link href="/announcements" className="text-xs text-blue-600 hover:underline font-medium flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardBody className="p-0">
            {announcements.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No announcements yet</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {announcements.slice(0, 4).map((a) => (
                  <li key={a.id} className="px-5 py-3.5 hover:bg-slate-50 transition">
                    <div className="flex items-start gap-2">
                      <Badge variant={a.category as 'school' | 'team' | 'class' | 'urgent'}>
                        {a.category}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{a.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{formatRelative(a.published_at)}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <span className="font-semibold text-slate-800 text-sm">Upcoming Events</span>
            <Link href="/calendar" className="text-xs text-blue-600 hover:underline font-medium flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardBody className="p-0">
            {events.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No upcoming events</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {events.slice(0, 4).map((event) => (
                  <li key={event.id} className="px-5 py-3.5">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-9 text-center">
                        <p className="text-xs text-slate-400 uppercase leading-tight">
                          {new Date(event.start_time).toLocaleDateString('en-US', { month: 'short' })}
                        </p>
                        <p className="text-base font-bold text-slate-800 leading-tight">
                          {new Date(event.start_time).getDate()}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{event.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant={event.event_type === 'athletics' ? 'team' : 'school'}>
                            {event.event_type}
                          </Badge>
                          <span className="text-xs text-slate-400">{formatTime(event.start_time)}</span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Quick actions for admin */}
      {profile.role === 'admin' && (
        <Card>
          <CardHeader>
            <span className="font-semibold text-slate-800 text-sm">Quick Actions</span>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Manage Students', href: '/admin/students', icon: Users },
                { label: 'Post Announcement', href: '/announcements/new', icon: Megaphone },
                { label: 'Add Event', href: '/calendar/new', icon: Calendar },
                { label: 'Manage Teams', href: '/admin/teams', icon: Trophy },
              ].map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition group text-center"
                >
                  <Icon className="w-5 h-5 text-slate-500 group-hover:text-blue-600" />
                  <span className="text-xs font-medium text-slate-600 group-hover:text-blue-700 leading-tight">{label}</span>
                </Link>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
