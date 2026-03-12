'use client'

import { useState } from 'react'
import { Trophy, Calendar, Clock, MapPin, User, Hash } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatTime, formatDate, formatRelative, getInitials } from '@/lib/utils'
import type { Profile, Team, Event, Announcement } from '@/types'

interface TeamWithRoster extends Team {
  team_memberships?: Array<{
    student: { id: string; first_name: string; last_name: string; grade: string } | null
    jersey_number?: string
    position?: string
  }>
}

interface AthleticsViewProps {
  teams: TeamWithRoster[]
  events: Event[]
  announcements: Announcement[]
  profile: Profile
}

export function AthleticsView({ teams, events, announcements, profile }: AthleticsViewProps) {
  const [selectedTeam, setSelectedTeam] = useState<TeamWithRoster | null>(teams[0] ?? null)
  const isStaff = ['admin', 'teacher', 'coach'].includes(profile.role)

  const teamEvents = selectedTeam
    ? events.filter((e) => e.team_id === selectedTeam.id || !e.team_id)
    : events

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="Athletics"
        subtitle="Teams, schedules, and coach updates"
      />

      {teams.length === 0 ? (
        <EmptyState icon={Trophy} title="No teams" description="No athletics teams have been set up yet." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Team selector + announcements */}
          <div className="lg:col-span-1 space-y-4">
            <div>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Teams</h2>
              <div className="space-y-2">
                {teams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => setSelectedTeam(team)}
                    className={`w-full text-left rounded-xl border p-3 transition ${
                      selectedTeam?.id === team.id
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        selectedTeam?.id === team.id ? 'bg-blue-500' : 'bg-green-100'
                      }`}>
                        <Trophy className={`w-4 h-4 ${selectedTeam?.id === team.id ? 'text-white' : 'text-green-600'}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{team.name}</p>
                        <p className="text-xs text-slate-500">{team.sport} · {team.season}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Team Announcements */}
            {announcements.length > 0 && (
              <Card>
                <CardHeader className="flex items-center gap-2 py-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Coach Updates</span>
                </CardHeader>
                <CardBody className="p-0">
                  <ul className="divide-y divide-slate-100">
                    {announcements
                      .filter((a) => !selectedTeam || a.team_id === selectedTeam.id)
                      .map((a) => (
                        <li key={a.id} className="px-4 py-3">
                          <p className="text-sm font-medium text-slate-800 leading-snug">{a.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{a.body}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {a.author?.full_name} · {formatRelative(a.published_at)}
                          </p>
                        </li>
                      ))}
                  </ul>
                </CardBody>
              </Card>
            )}
          </div>

          {/* Right: Team detail */}
          <div className="lg:col-span-2 space-y-4">
            {selectedTeam && (
              <>
                {/* Team header */}
                <Card>
                  <CardBody>
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Trophy className="w-7 h-7 text-green-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">{selectedTeam.name}</h2>
                        <div className="flex gap-2 mt-1 flex-wrap">
                          <Badge variant="team">{selectedTeam.sport}</Badge>
                          <Badge variant="default">{selectedTeam.season}</Badge>
                        </div>
                        {selectedTeam.coach && (
                          <p className="text-sm text-slate-500 mt-1.5 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" />
                            Coach: {selectedTeam.coach.full_name}
                          </p>
                        )}
                        {selectedTeam.description && (
                          <p className="text-sm text-slate-600 mt-2">{selectedTeam.description}</p>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Upcoming games */}
                <Card>
                  <CardHeader className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span className="font-semibold text-slate-800 text-sm">Upcoming Schedule</span>
                  </CardHeader>
                  <CardBody className="p-0">
                    {teamEvents.length === 0 ? (
                      <p className="text-sm text-slate-500 px-5 py-4">No upcoming events</p>
                    ) : (
                      <ul className="divide-y divide-slate-100">
                        {teamEvents.map((event) => (
                          <li key={event.id} className="px-5 py-3.5 flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 text-center">
                              <p className="text-xs text-slate-400 uppercase leading-tight">
                                {new Date(event.start_time).toLocaleDateString('en-US', { month: 'short' })}
                              </p>
                              <p className="text-lg font-bold text-slate-800 leading-tight">
                                {new Date(event.start_time).getDate()}
                              </p>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-800">{event.title}</p>
                              <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatTime(event.start_time)}
                                  {event.end_time && ` – ${formatTime(event.end_time)}`}
                                </span>
                                {event.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {event.location}
                                  </span>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardBody>
                </Card>

                {/* Roster (staff or parents can see) */}
                <Card>
                  <CardHeader className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-500" />
                    <span className="font-semibold text-slate-800 text-sm">
                      Roster ({selectedTeam.team_memberships?.length ?? 0} players)
                    </span>
                  </CardHeader>
                  <CardBody className="p-0">
                    {(!selectedTeam.team_memberships || selectedTeam.team_memberships.length === 0) ? (
                      <p className="text-sm text-slate-500 px-5 py-4">No players on roster</p>
                    ) : (
                      <ul className="divide-y divide-slate-100">
                        {selectedTeam.team_memberships.map(({ student, jersey_number, position }, idx) => {
                          if (!student) return null
                          return (
                            <li key={idx} className="px-5 py-3 flex items-center gap-3">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold text-green-700">
                                {getInitials(`${student.first_name} ${student.last_name}`)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-800">
                                  {student.first_name} {student.last_name}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {student.grade} Grade
                                  {position && ` · ${position}`}
                                </p>
                              </div>
                              {jersey_number && (
                                <div className="flex items-center gap-0.5 text-slate-500">
                                  <Hash className="w-3 h-3" />
                                  <span className="text-sm font-bold text-slate-700">{jersey_number}</span>
                                </div>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </CardBody>
                </Card>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
