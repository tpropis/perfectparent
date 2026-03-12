import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NewMessageForm } from '@/components/messaging/NewMessageForm'
import type { Profile } from '@/types'

export default async function NewMessagePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')

  const p = profile as Profile

  if (!['admin', 'teacher', 'coach'].includes(p.role)) redirect('/messages')

  // Fetch parents to message
  const { data: parents } = await supabase
    .from('profiles')
    .select('*')
    .eq('school_id', p.school_id)
    .eq('role', 'parent')

  return <NewMessageForm profile={p} recipients={parents ?? []} />
}
