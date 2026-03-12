import Link from 'next/link'
import {
  User,
  Megaphone,
  MessageSquare,
  Calendar,
  Trophy,
  ChevronRight,
  AlertTriangle,
  Clock,
  BookOpen,
} from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatDate, formatTime, formatRelative, getInitials, getCategoryColor } from '@/lib/utils'
import type { Profile, Announcement, MessageRecipient, Event, Student } from '@/types'

interface StudentWithRelations extends Student {
  team_memberships: Array<{ team: { id: string; name: string; sport: string } | null }>
  student_classes: Array<{ class: { id: string; name: string; subject: string } | null }>
}

interface ParentStudentWithRelations {
  id: string
  parent_id: string
  student_id: string
  relationship: string
  created_at: string
  student?: StudentWithRelations
}

interface ParentDashboardProps {
  profile: Profile
  parentStudents: ParentStudentWithRelations[]
  announcements: Announcement[]
  messageRecipients: MessageRecipient[]
  events: Event[]
}

export function ParentDashboard({ profile, parentStudents, announcements, messageRecipients, events }: ParentDashboardProps) {
  const firstName = profile.full_name.split(' ')[0]
  const urgentCount = announcements.filter((a) => a.category === 'urgent').length
  const unreadCount = messageRecipients.filter((mr) => !mr.read_at).length

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Good morning, {firstName}</h1>
        <p className="text-slate-500 mt-0.5 text-sm">Here's what's happening at Westlake Academy today.</p>
      </div>

      {/* Urgent alert */}
      {urgentCount > 0 && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              {urgentCount} urgent {urgentCount === 1 ? 'notice' : 'notices'}
            </p>
            <p className="text-xs text-red-600 mt-0.5">Review the Announcements section below.</p>
          </div>
          <Link href="/announcements" className="ml-auto text-xs text-red-700 font-medium hover:underline flex-shrink-0">
            View →
          </Link>
        </div>
      )}

      {/* Student cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-slate-800">Your Children</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {parentStudents.map(({ student }) => {
            if (!student) return null
            const teams = student.team_memberships ?? []
            const classes = student.student_classes ?? []
            return (
              <Link key={student.id} href={`/students/${student.id}`}>
                <Card hover className="h-full">
                  <CardBody className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 font-bold text-lg flex-shrink-0">
                      {getInitials(`${student.first_name} ${student.last_name}`)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900">{student.first_name} {student.last_name}</p>
                      <p className="text-sm text-slate-500">{student.grade} Grade · #{student.student_id_number}</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {classes.slice(0, 2).map(({ class: cls }, i) => cls ? (
                          <Badge key={cls.id ?? i} variant="class">{cls.subject}</Badge>
                        ) : null)}
                        {teams.slice(0, 1).map(({ team }, i) => team ? (
                          <Badge key={team.id ?? i} variant="team">{team.sport}</Badge>
                        ) : null)}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
                  </CardBody>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {/* 2-column grid: Announcements + Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Announcements */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-slate-500" />
              <span className="font-semibold text-slate-800 text-sm">Announcements</span>
            </div>
            <Link href="/announcements" className="text-xs text-blue-600 hover:underline font-medium">
              View all
            </Link>
          </CardHeader>
          <CardBody className="p-0">
            {announcements.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No announcements</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {announcements.map((a) => (
                  <li key={a.id} className="px-5 py-3.5 hover:bg-slate-50 transition">
                    <Link href="/announcements">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <Badge variant={a.category as 'school' | 'team' | 'class' | 'urgent'}>
                              {a.category}
                            </Badge>
                            {a.is_pinned && (
                              <span className="text-xs text-amber-600 font-medium">Pinned</span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-slate-800 leading-snug">{a.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5 truncate">{a.body}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {a.author?.full_name} · {formatRelative(a.published_at)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="font-semibold text-slate-800 text-sm">Upcoming</span>
            </div>
            <Link href="/calendar" className="text-xs text-blue-600 hover:underline font-medium">
              View all
            </Link>
          </CardHeader>
          <CardBody className="p-0">
            {events.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No upcoming events</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {events.map((event) => (
                  <li key={event.id} className="px-5 py-3.5">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 text-center">
                        <p className="text-xs text-slate-400 uppercase leading-tight">
                          {new Date(event.start_time).toLocaleDateString('en-US', { month: 'short' })}
                        </p>
                        <p className="text-lg font-bold text-slate-800 leading-tight">
                          {new Date(event.start_time).getDate()}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 leading-snug">{event.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant={event.event_type === 'athletics' ? 'team' : event.event_type === 'academic' ? 'class' : 'school'}>
                            {event.event_type}
                          </Badge>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(event.start_time)}
                          </span>
                        </div>
                        {event.location && (
                          <p className="text-xs text-slate-400 mt-0.5 truncate">{event.location}</p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Messages */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-slate-500" />
            <span className="font-semibold text-slate-800 text-sm">Recent Messages</span>
            {unreadCount > 0 && (
              <span className="bg-blue-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 leading-none">
                {unreadCount}
              </span>
            )}
          </div>
          <Link href="/messages" className="text-xs text-blue-600 hover:underline font-medium">
            View all
          </Link>
        </CardHeader>
        <CardBody className="p-0">
          {messageRecipients.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No messages</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {messageRecipients.map(({ id, message, read_at }) => {
                if (!message) return null
                return (
                  <li key={id} className={`px-5 py-3.5 hover:bg-slate-50 transition ${!read_at ? 'bg-blue-50/40' : ''}`}>
                    <Link href="/messages">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 flex-shrink-0">
                          {message.sender ? getInitials(message.sender.full_name) : '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`text-sm font-medium ${!read_at ? 'text-slate-900' : 'text-slate-700'}`}>
                              {message.sender?.full_name}
                            </p>
                            <span className="text-xs text-slate-400 flex-shrink-0">{formatRelative(message.created_at)}</span>
                          </div>
                          <p className={`text-sm leading-snug ${!read_at ? 'font-medium text-slate-800' : 'text-slate-600'}`}>
                            {message.subject}
                          </p>
                          <p className="text-xs text-slate-500 truncate mt-0.5">{message.body}</p>
                        </div>
                        {!read_at && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />}
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
