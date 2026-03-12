import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TeamsTable } from '@/components/admin/TeamsTable'
import type { Profile } from '@/types'

export default async function AdminTeamsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile || !['admin', 'coach'].includes((profile as Profile).role)) redirect('/dashboard')

  const { data: teams } = await supabase
    .from('teams')
    .select(`
      *,
      coach:profiles(*),
      team_memberships(id)
    `)
    .eq('school_id', (profile as Profile).school_id)
    .order('name')

  return <TeamsTable teams={teams ?? []} />
}
