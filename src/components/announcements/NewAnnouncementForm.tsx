'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { Card, CardBody } from '@/components/ui/Card'
import type { Profile, Team } from '@/types'

interface NewAnnouncementFormProps {
  profile: Profile
  teams: Team[]
}

export function NewAnnouncementForm({ profile, teams }: NewAnnouncementFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState<'school' | 'team' | 'class' | 'urgent'>('school')
  const [teamId, setTeamId] = useState('')
  const [isPinned, setIsPinned] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.from('announcements').insert({
      author_id: profile.id,
      school_id: profile.school_id,
      team_id: category === 'team' && teamId ? teamId : null,
      title,
      body,
      category,
      is_pinned: isPinned,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/announcements')
      router.refresh()
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Link href="/announcements" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition">
        <ChevronLeft className="w-4 h-4" />
        Back to Announcements
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">New Announcement</h1>
        <p className="text-slate-500 mt-0.5 text-sm">Post an update to students, parents, and staff.</p>
      </div>

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
              <div className="grid grid-cols-4 gap-2">
                {(['school', 'class', 'team', 'urgent'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium border transition capitalize ${
                      category === cat
                        ? cat === 'urgent'
                          ? 'bg-red-50 border-red-300 text-red-700'
                          : cat === 'team'
                          ? 'bg-green-50 border-green-300 text-green-700'
                          : cat === 'class'
                          ? 'bg-purple-50 border-purple-300 text-purple-700'
                          : 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {category === 'team' && teams.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Team</label>
                <select
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a team...</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Announcement title..."
                required
                maxLength={120}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Write your announcement here..."
                required
              />
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">Pin to top of announcements</span>
            </label>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 px-4 rounded-xl transition"
              >
                {loading ? 'Posting...' : 'Post Announcement'}
              </button>
              <Link
                href="/announcements"
                className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-medium text-sm transition"
              >
                Cancel
              </Link>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
