'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calendar, Clock, MapPin, Plus, Trophy, BookOpen, School, ChevronDown } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate, formatTime } from '@/lib/utils'
import type { Event, Profile } from '@/types'

const EVENT_TYPE_ICON: Record<string, React.ElementType> = {
  school: School,
  athletics: Trophy,
  academic: BookOpen,
  other: Calendar,
}

const EVENT_TYPE_BADGE: Record<string, 'school' | 'team' | 'class' | 'default'> = {
  school: 'school',
  athletics: 'team',
  academic: 'class',
  other: 'default',
}

interface CalendarViewProps {
  events: Event[]
  profile: Profile
}

type FilterType = 'all' | 'school' | 'athletics' | 'academic'

export function CalendarView({ events, profile }: CalendarViewProps) {
  const [filter, setFilter] = useState<FilterType>('all')
  const canCreate = ['admin', 'teacher', 'coach'].includes(profile.role)

  const now = new Date()
  const upcoming = events.filter((e) => new Date(e.start_time) >= now)
  const past = events.filter((e) => new Date(e.start_time) < now)

  const filtered = (list: Event[]) =>
    filter === 'all' ? list : list.filter((e) => e.event_type === filter)

  // Group by month
  function groupByMonth(evts: Event[]) {
    const groups: Record<string, Event[]> = {}
    evts.forEach((e) => {
      const key = new Date(e.start_time).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      if (!groups[key]) groups[key] = []
      groups[key].push(e)
    })
    return groups
  }

  const upcomingGrouped = groupByMonth(filtered(upcoming))
  const pastGrouped = groupByMonth(filtered(past).reverse())

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Calendar"
        subtitle="School events, athletics, and important dates"
        action={canCreate ? (
          <Link
            href="/calendar/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </Link>
        ) : undefined}
      />

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'school', 'athletics', 'academic'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition capitalize ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            {f === 'all' ? 'All Events' : f}
          </button>
        ))}
      </div>

      {events.length === 0 ? (
        <EmptyState icon={Calendar} title="No events" description="Events will appear here when they are added." />
      ) : (
        <div className="space-y-6">
          {/* Upcoming */}
          {Object.keys(upcomingGrouped).length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Upcoming</h2>
              <div className="space-y-4">
                {Object.entries(upcomingGrouped).map(([month, monthEvents]) => (
                  <div key={month}>
                    <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 px-1">{month}</h3>
                    <div className="space-y-2">
                      {monthEvents.map((event) => (
                        <EventCard key={event.id} event={event} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past */}
          {Object.keys(pastGrouped).length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Past Events</h2>
              <div className="space-y-2 opacity-60">
                {Object.values(pastGrouped).flat().slice(0, 5).map((event) => (
                  <EventCard key={event.id} event={event} past />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function EventCard({ event, past }: { event: Event; past?: boolean }) {
  const Icon = EVENT_TYPE_ICON[event.event_type] ?? Calendar

  return (
    <Card className={past ? 'border-slate-200' : ''}>
      <CardBody className="flex items-start gap-4 py-3.5">
        {/* Date column */}
        <div className="flex-shrink-0 w-12 text-center">
          <p className="text-xs text-slate-400 uppercase leading-tight">
            {new Date(event.start_time).toLocaleDateString('en-US', { month: 'short' })}
          </p>
          <p className="text-xl font-bold text-slate-800 leading-tight">
            {new Date(event.start_time).getDate()}
          </p>
          <p className="text-xs text-slate-400">
            {new Date(event.start_time).toLocaleDateString('en-US', { weekday: 'short' })}
          </p>
        </div>

        {/* Divider */}
        <div className="w-px bg-slate-200 self-stretch flex-shrink-0" />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Badge variant={EVENT_TYPE_BADGE[event.event_type]}>
                  {event.event_type}
                </Badge>
                {event.team && <span className="text-xs text-slate-500">· {event.team.name}</span>}
              </div>
              <h3 className="font-semibold text-slate-900 leading-snug">{event.title}</h3>
              {event.description && (
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{event.description}</p>
              )}
            </div>
            <Icon className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
          </div>

          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="w-3 h-3" />
              {formatTime(event.start_time)}
              {event.end_time && ` – ${formatTime(event.end_time)}`}
            </span>
            {event.location && (
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <MapPin className="w-3 h-3" />
                {event.location}
              </span>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
