import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AthleticsView } from '@/components/athletics/AthleticsView'
import type { Profile } from '@/types'

export default async function AthleticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')

  const p = profile as Profile

  const { data: teams } = await supabase
    .from('teams')
    .select(`
      *,
      coach:profiles(*),
      team_memberships(
        *,
        student:students(*)
      )
    `)
    .eq('school_id', p.school_id)
    .order('name')

  const { data: athleticsEvents } = await supabase
    .from('events')
    .select('*, team:teams(*)')
    .eq('school_id', p.school_id)
    .eq('event_type', 'athletics')
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true })

  const { data: athleticsAnnouncements } = await supabase
    .from('announcements')
    .select('*, author:profiles(*), team:teams(*)')
    .eq('school_id', p.school_id)
    .eq('category', 'team')
    .order('published_at', { ascending: false })
    .limit(5)

  return (
    <AthleticsView
      teams={teams ?? []}
      events={athleticsEvents ?? []}
      announcements={athleticsAnnouncements ?? []}
      profile={p}
    />
  )
}
