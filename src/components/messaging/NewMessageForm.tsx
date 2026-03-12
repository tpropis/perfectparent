'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import type { Profile } from '@/types'

interface NewMessageFormProps {
  profile: Profile
  recipients: Profile[]
}

export function NewMessageForm({ profile, recipients }: NewMessageFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [recipientId, setRecipientId] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState<'general' | 'class' | 'team' | 'urgent'>('general')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!recipientId) { setError('Please select a recipient.'); return }
    setLoading(true)
    setError('')

    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert({
        sender_id: profile.id,
        school_id: profile.school_id,
        subject,
        body,
        category,
      })
      .select()
      .single()

    if (msgError || !message) {
      setError(msgError?.message ?? 'Failed to send message')
      setLoading(false)
      return
    }

    const { error: recipientError } = await supabase
      .from('message_recipients')
      .insert({ message_id: message.id, recipient_id: recipientId })

    if (recipientError) {
      setError(recipientError.message)
      setLoading(false)
      return
    }

    router.push('/messages')
    router.refresh()
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Link href="/messages" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition">
        <ChevronLeft className="w-4 h-4" />
        Back to Messages
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">New Message</h1>
        <p className="text-slate-500 mt-0.5 text-sm">Send a direct message to a parent or student.</p>
      </div>

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">To</label>
              <select
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select recipient...</option>
                {recipients.map((r) => (
                  <option key={r.id} value={r.id}>{r.full_name} ({r.email})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
              <div className="grid grid-cols-4 gap-2">
                {(['general', 'class', 'team', 'urgent'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium border transition capitalize ${
                      category === cat
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Message subject..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Write your message..."
                required
              />
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 px-4 rounded-xl transition"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
              <Link
                href="/messages"
                className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-medium text-sm transition"
              >
                Cancel
              </Link>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
