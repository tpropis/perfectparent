import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ParentDashboard } from '@/components/dashboard/ParentDashboard'
import { StaffDashboard } from '@/components/dashboard/StaffDashboard'
import type { Profile } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  const p = profile as Profile

  if (p.role === 'parent') {
    // Fetch parent's children
    const { data: parentStudents } = await supabase
      .from('parent_students')
      .select(`
        *,
        student:students(
          *,
          team_memberships(*, team:teams(*)),
          student_classes(*, class:classes(*, teacher:profiles(*)))
        )
      `)
      .eq('parent_id', user.id)

    // Fetch announcements
    const { data: announcements } = await supabase
      .from('announcements')
      .select('*, author:profiles(*), team:teams(*)')
      .eq('school_id', p.school_id)
      .order('published_at', { ascending: false })
      .limit(5)

    // Fetch recent messages
    const { data: messageRecipients } = await supabase
      .from('message_recipients')
      .select('*, message:messages(*, sender:profiles(*))')
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    // Fetch upcoming events
    const { data: events } = await supabase
      .from('events')
      .select('*, team:teams(*)')
      .eq('school_id', p.school_id)
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })
      .limit(6)

    return (
      <ParentDashboard
        profile={p}
        parentStudents={parentStudents ?? []}
        announcements={announcements ?? []}
        messageRecipients={messageRecipients ?? []}
        events={events ?? []}
      />
    )
  }

  // Staff / coach / admin dashboard
  const { data: announcements } = await supabase
    .from('announcements')
    .select('*, author:profiles(*), team:teams(*)')
    .eq('school_id', p.school_id)
    .order('published_at', { ascending: false })
    .limit(5)

  const { data: events } = await supabase
    .from('events')
    .select('*, team:teams(*)')
    .eq('school_id', p.school_id)
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true })
    .limit(6)

  const { data: studentCount } = await supabase
    .from('students')
    .select('id', { count: 'exact', head: true })
    .eq('school_id', p.school_id)

  return (
    <StaffDashboard
      profile={p}
      announcements={announcements ?? []}
      events={events ?? []}
      studentCount={(studentCount as unknown as { count: number })?.count ?? 0}
    />
  )
}
