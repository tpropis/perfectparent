import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StudentsTable } from '@/components/admin/StudentsTable'
import type { Profile } from '@/types'

export default async function StudentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')

  const p = profile as Profile
  if (!['admin', 'teacher', 'coach'].includes(p.role)) redirect('/dashboard')

  const { data: students } = await supabase
    .from('students')
    .select(`
      *,
      school:schools(name),
      team_memberships(team:teams(name, sport)),
      student_classes(class:classes(name, subject))
    `)
    .eq('school_id', p.school_id)
    .order('last_name')

  return <StudentsTable students={students ?? []} />
}
