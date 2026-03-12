import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NewEventForm } from '@/components/calendar/NewEventForm'
import type { Profile } from '@/types'

export default async function NewEventPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')

  const p = profile as Profile

  if (!['admin', 'teacher', 'coach'].includes(p.role)) redirect('/calendar')

  const { data: teams } = await supabase
    .from('teams')
    .select('*')
    .eq('school_id', p.school_id)

  return <NewEventForm profile={p} teams={teams ?? []} />
}
