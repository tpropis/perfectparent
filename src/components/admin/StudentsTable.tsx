import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { getInitials } from '@/lib/utils'
import type { Student } from '@/types'

interface StudentsTableProps {
  students: (Student & {
    team_memberships?: Array<{ team: { name: string; sport: string } | null }>
    student_classes?: Array<{ class: { name: string; subject: string } | null }>
  })[]
}

export function StudentsTable({ students }: StudentsTableProps) {
  const gradeGroups = students.reduce((acc, s) => {
    if (!acc[s.grade]) acc[s.grade] = []
    acc[s.grade].push(s)
    return acc
  }, {} as Record<string, typeof students>)

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition">
        <ChevronLeft className="w-4 h-4" />
        Back to Admin
      </Link>

      <PageHeader title="Students" subtitle={`${students.length} students enrolled at Westlake Academy`} />

      {Object.entries(gradeGroups).map(([grade, gradeStudents]) => (
        <div key={grade}>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{grade} Grade ({gradeStudents.length})</h2>
          <Card>
            <CardBody className="p-0">
              <ul className="divide-y divide-slate-100">
                {gradeStudents.map((student) => {
                  const teams = student.team_memberships?.map((m) => m.team).filter(Boolean) ?? []
                  const classes = student.student_classes?.map((m) => m.class).filter(Boolean) ?? []
                  return (
                    <Link key={student.id} href={`/students/${student.id}`}>
                      <li className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition cursor-pointer">
                        <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600 flex-shrink-0">
                          {getInitials(`${student.first_name} ${student.last_name}`)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800">
                            {student.first_name} {student.last_name}
                          </p>
                          <p className="text-xs text-slate-500">ID: {student.student_id_number}</p>
                          <div className="flex gap-1.5 mt-1 flex-wrap">
                            {classes.slice(0, 2).map((cls) => cls && (
                              <Badge key={cls.name} variant="class">{cls.subject}</Badge>
                            ))}
                            {teams.slice(0, 1).map((team) => team && (
                              <Badge key={team.name} variant="team">{team.sport}</Badge>
                            ))}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      </li>
                    </Link>
                  )
                })}
              </ul>
            </CardBody>
          </Card>
        </div>
      ))}
    </div>
  )
}
