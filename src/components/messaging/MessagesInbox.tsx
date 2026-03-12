'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MessageSquare, Plus, Send } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatRelative, getInitials } from '@/lib/utils'
import type { Profile, MessageRecipient, Message } from '@/types'

interface MessagesInboxProps {
  profile: Profile
  inbox: MessageRecipient[]
  sent: Message[]
}

export function MessagesInbox({ profile, inbox, sent }: MessagesInboxProps) {
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox')
  const [selected, setSelected] = useState<MessageRecipient | null>(null)

  const canSend = ['admin', 'teacher', 'coach'].includes(profile.role)
  const unread = inbox.filter((m) => !m.read_at).length

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Messages"
        subtitle="Your communication hub"
        action={canSend ? (
          <Link
            href="/messages/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
          >
            <Plus className="w-4 h-4" />
            New Message
          </Link>
        ) : undefined}
      />

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-1">
        <button
          onClick={() => { setSelected(null); setActiveTab('inbox') }}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition -mb-px ${
            activeTab === 'inbox'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Inbox
          {unread > 0 && (
            <span className="ml-2 bg-blue-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5">
              {unread}
            </span>
          )}
        </button>
        {canSend && (
          <button
            onClick={() => { setSelected(null); setActiveTab('sent') }}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition -mb-px ${
              activeTab === 'sent'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Sent
          </button>
        )}
      </div>

      {activeTab === 'inbox' ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Message list */}
          <div className="lg:col-span-2 space-y-2">
            {inbox.length === 0 ? (
              <EmptyState icon={MessageSquare} title="No messages" description="Messages from teachers and coaches will appear here." />
            ) : (
              inbox.map((item) => {
                if (!item.message) return null
                const isSelected = selected?.id === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelected(item)}
                    className={`w-full text-left rounded-xl border transition p-3.5 ${
                      isSelected
                        ? 'border-blue-300 bg-blue-50'
                        : !item.read_at
                        ? 'border-slate-200 bg-blue-50/40 hover:bg-slate-50'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 flex-shrink-0">
                        {item.message.sender ? getInitials(item.message.sender.full_name) : '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-sm ${!item.read_at ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'} truncate`}>
                            {item.message.sender?.full_name}
                          </p>
                          <span className="text-xs text-slate-400 flex-shrink-0">
                            {formatRelative(item.message.created_at)}
                          </span>
                        </div>
                        <p className={`text-sm truncate ${!item.read_at ? 'font-medium text-slate-800' : 'text-slate-600'}`}>
                          {item.message.subject}
                        </p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{item.message.body}</p>
                      </div>
                      {!item.read_at && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />}
                    </div>
                  </button>
                )
              })
            )}
          </div>

          {/* Message detail */}
          <div className="lg:col-span-3">
            {selected?.message ? (
              <Card>
                <CardBody className="space-y-4">
                  <div>
                    <Badge variant={selected.message.category as 'general' | 'class' | 'team' | 'urgent'}>
                      {selected.message.category}
                    </Badge>
                    <h2 className="text-lg font-semibold text-slate-900 mt-2">{selected.message.subject}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-[10px] font-bold text-blue-600">
                        {selected.message.sender ? getInitials(selected.message.sender.full_name) : '?'}
                      </div>
                      <p className="text-sm text-slate-600">
                        {selected.message.sender?.full_name} ·{' '}
                        {new Date(selected.message.created_at).toLocaleDateString('en-US', {
                          weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-slate-100 pt-4">
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{selected.message.body}</p>
                  </div>
                </CardBody>
              </Card>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400 hidden lg:flex">
                <MessageSquare className="w-8 h-8 mb-2" />
                <p className="text-sm">Select a message to read</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Sent messages */
        <div className="space-y-2">
          {sent.length === 0 ? (
            <EmptyState icon={Send} title="No sent messages" description="Messages you send will appear here." />
          ) : (
            sent.map((msg) => (
              <Card key={msg.id}>
                <CardBody className="py-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant={msg.category as 'general' | 'class' | 'team' | 'urgent'}>{msg.category}</Badge>
                        <p className="text-sm font-medium text-slate-800 truncate">{msg.subject}</p>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{msg.body}</p>
                    </div>
                    <span className="text-xs text-slate-400 flex-shrink-0">{formatRelative(msg.created_at)}</span>
                  </div>
                </CardBody>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
