import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NewAnnouncementForm } from '@/components/announcements/NewAnnouncementForm'
import type { Profile } from '@/types'

export default async function NewAnnouncementPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')

  const p = profile as Profile

  // Only staff can post
  if (!['admin', 'teacher', 'coach'].includes(p.role)) redirect('/announcements')

  const { data: teams } = await supabase
    .from('teams')
    .select('*')
    .eq('school_id', p.school_id)

  return <NewAnnouncementForm profile={p} teams={teams ?? []} />
}
