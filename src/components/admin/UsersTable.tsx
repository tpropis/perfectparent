import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { getRoleColor, getInitials } from '@/lib/utils'
import type { Profile } from '@/types'

interface UsersTableProps {
  users: Profile[]
}

const ROLE_ORDER = ['admin', 'teacher', 'coach', 'parent', 'student']

export function UsersTable({ users }: UsersTableProps) {
  const sorted = [...users].sort((a, b) => {
    const ri = ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role)
    return ri !== 0 ? ri : a.full_name.localeCompare(b.full_name)
  })

  const roleGroups = ROLE_ORDER.reduce((acc, role) => {
    const group = sorted.filter((u) => u.role === role)
    if (group.length > 0) acc[role] = group
    return acc
  }, {} as Record<string, Profile[]>)

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition">
        <ChevronLeft className="w-4 h-4" />
        Back to Admin
      </Link>

      <PageHeader title="Users" subtitle={`${users.length} accounts at Westlake Academy`} />

      {Object.entries(roleGroups).map(([role, roleUsers]) => (
        <div key={role}>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 capitalize">{role}s ({roleUsers.length})</h2>
          <Card>
            <CardBody className="p-0">
              <ul className="divide-y divide-slate-100">
                {roleUsers.map((user) => (
                  <li key={user.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition">
                    <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600 flex-shrink-0">
                      {getInitials(user.full_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{user.full_name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                    <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </div>
      ))}
    </div>
  )
}
