import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AnnouncementsFeed } from '@/components/announcements/AnnouncementsFeed'
import type { Profile } from '@/types'

export default async function AnnouncementsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')

  const { data: announcements } = await supabase
    .from('announcements')
    .select('*, author:profiles(*), team:teams(*)')
    .eq('school_id', (profile as Profile).school_id)
    .order('is_pinned', { ascending: false })
    .order('published_at', { ascending: false })

  return (
    <AnnouncementsFeed
      announcements={announcements ?? []}
      profile={profile as Profile}
    />
  )
}
