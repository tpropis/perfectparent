import Link from 'next/link'
import { Pin, AlertTriangle, Plus } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate, formatRelative, getInitials } from '@/lib/utils'
import { Megaphone } from 'lucide-react'
import type { Announcement, Profile } from '@/types'

interface AnnouncementsFeedProps {
  announcements: Announcement[]
  profile: Profile
}

const CATEGORY_LABELS: Record<string, string> = {
  school: 'School-Wide',
  team: 'Team',
  class: 'Classroom',
  urgent: 'Urgent',
}

export function AnnouncementsFeed({ announcements, profile }: AnnouncementsFeedProps) {
  const canPost = ['admin', 'teacher', 'coach'].includes(profile.role)
  const pinned = announcements.filter((a) => a.is_pinned)
  const rest = announcements.filter((a) => !a.is_pinned)

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Announcements"
        subtitle="Stay up to date with what's happening at Westlake Academy"
        action={canPost ? (
          <Link
            href="/announcements/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
          >
            <Plus className="w-4 h-4" />
            Post
          </Link>
        ) : undefined}
      />

      {announcements.length === 0 ? (
        <EmptyState icon={Megaphone} title="No announcements" description="Check back soon for updates from the school." />
      ) : (
        <div className="space-y-3">
          {/* Pinned */}
          {pinned.map((a) => (
            <AnnouncementCard key={a.id} announcement={a} highlighted />
          ))}

          {/* Rest */}
          {rest.map((a) => (
            <AnnouncementCard key={a.id} announcement={a} />
          ))}
        </div>
      )}
    </div>
  )
}

function AnnouncementCard({ announcement: a, highlighted }: { announcement: Announcement; highlighted?: boolean }) {
  return (
    <Card className={highlighted ? 'border-amber-200 bg-amber-50/30' : ''}>
      <CardBody className="space-y-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={a.category as 'school' | 'team' | 'class' | 'urgent'}>
              {CATEGORY_LABELS[a.category] ?? a.category}
            </Badge>
            {a.team && <span className="text-xs text-slate-500">· {a.team.name}</span>}
            {a.is_pinned && (
              <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                <Pin className="w-3 h-3" /> Pinned
              </span>
            )}
          </div>
          <span className="text-xs text-slate-400 flex-shrink-0">{formatRelative(a.published_at)}</span>
        </div>

        {/* Urgent banner */}
        {a.category === 'urgent' && (
          <div className="flex items-center gap-2 text-red-600 text-xs font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            Important notice — please read carefully
          </div>
        )}

        {/* Title + body */}
        <div>
          <h3 className="font-semibold text-slate-900 leading-snug">{a.title}</h3>
          <p className="text-sm text-slate-600 mt-1.5 leading-relaxed whitespace-pre-line">{a.body}</p>
        </div>

        {/* Author */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-[10px] font-bold text-blue-600">
            {a.author ? getInitials(a.author.full_name) : '?'}
          </div>
          <span className="text-xs text-slate-500">{a.author?.full_name}</span>
          <span className="text-xs text-slate-400">· {formatDate(a.published_at)}</span>
        </div>
      </CardBody>
    </Card>
  )
}
