import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StudentProfile } from '@/components/student/StudentProfile'

export default async function StudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  // For parents: verify they have access to this student
  if (profile.role === 'parent') {
    const { data: link } = await supabase
      .from('parent_students')
      .select('id')
      .eq('parent_id', user.id)
      .eq('student_id', id)
      .single()

    if (!link) return notFound()
  }

  const { data: student } = await supabase
    .from('students')
    .select(`
      *,
      school:schools(*),
      team_memberships(*, team:teams(*, coach:profiles(*))),
      student_classes(*, class:classes(*, teacher:profiles(*)))
    `)
    .eq('id', id)
    .single()

  if (!student) return notFound()

  const { data: attendance } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('student_id', id)
    .order('date', { ascending: false })
    .limit(10)

  return (
    <StudentProfile
      student={student}
      attendance={attendance ?? []}
      viewerRole={profile.role}
    />
  )
}
