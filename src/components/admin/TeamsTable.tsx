import Link from 'next/link'
import { ChevronLeft, Trophy, User } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import type { Team } from '@/types'

interface TeamsTableProps {
  teams: (Team & {
    coach?: { full_name: string } | null
    team_memberships?: { id: string }[]
  })[]
}

export function TeamsTable({ teams }: TeamsTableProps) {
  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition">
        <ChevronLeft className="w-4 h-4" />
        Back to Admin
      </Link>

      <PageHeader title="Athletics Teams" subtitle={`${teams.length} teams at Westlake Academy`} />

      <Card>
        <CardBody className="p-0">
          {teams.length === 0 ? (
            <p className="text-sm text-slate-500 px-5 py-8 text-center">No teams yet</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {teams.map((team) => (
                <li key={team.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{team.name}</p>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                      {team.coach && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {team.coach.full_name}
                        </span>
                      )}
                      <span>{team.team_memberships?.length ?? 0} players</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <Badge variant="team">{team.sport}</Badge>
                    <p className="text-xs text-slate-400 mt-1">{team.season}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
