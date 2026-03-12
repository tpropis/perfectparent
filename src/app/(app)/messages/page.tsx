import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MessagesInbox } from '@/components/messaging/MessagesInbox'
import type { Profile } from '@/types'

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')

  const p = profile as Profile

  // For parents/students: inbox
  const { data: inbox } = await supabase
    .from('message_recipients')
    .select('*, message:messages(*, sender:profiles(*))')
    .eq('recipient_id', user.id)
    .order('created_at', { ascending: false })

  // For staff: sent messages
  const { data: sent } = await supabase
    .from('messages')
    .select('*')
    .eq('sender_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <MessagesInbox
      profile={p}
      inbox={inbox ?? []}
      sent={sent ?? []}
    />
  )
}
