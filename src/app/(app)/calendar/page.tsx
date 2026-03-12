import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CalendarView } from '@/components/calendar/CalendarView'
import type { Profile } from '@/types'

export default async function CalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')

  const p = profile as Profile

  const { data: events } = await supabase
    .from('events')
    .select('*, team:teams(*), creator:profiles(*)')
    .eq('school_id', p.school_id)
    .order('start_time', { ascending: true })

  return <CalendarView events={events ?? []} profile={p} />
}
