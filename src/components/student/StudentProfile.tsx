import Link from 'next/link'
import {
  User,
  GraduationCap,
  Phone,
  Trophy,
  BookOpen,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ChevronLeft,
} from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { getInitials, formatDate } from '@/lib/utils'
import type { Student, AttendanceRecord, UserRole } from '@/types'

const ATTENDANCE_ICON: Record<string, React.ElementType> = {
  present: CheckCircle2,
  absent: XCircle,
  tardy: Clock,
  excused: AlertCircle,
}

const ATTENDANCE_COLOR: Record<string, string> = {
  present: 'text-emerald-600',
  absent: 'text-red-500',
  tardy: 'text-amber-500',
  excused: 'text-blue-500',
}

interface StudentProfileProps {
  student: Student & {
    team_memberships?: Array<{ team: { id: string; name: string; sport: string; season: string; coach?: { full_name: string } | null } | null; jersey_number?: string; position?: string }>
    student_classes?: Array<{ class: { id: string; name: string; subject: string; period?: string; room?: string; teacher?: { full_name: string } | null } | null }>
  }
  attendance: AttendanceRecord[]
  viewerRole: UserRole
}

export function StudentProfile({ student, attendance, viewerRole }: StudentProfileProps) {
  const presentDays = attendance.filter((a) => a.status === 'present').length
  const attendanceRate = attendance.length > 0 ? Math.round((presentDays / attendance.length) * 100) : 100

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back */}
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition">
        <ChevronLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* Header card */}
      <Card>
        <CardBody className="flex items-start gap-5 sm:gap-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 font-bold text-2xl flex-shrink-0">
            {getInitials(`${student.first_name} ${student.last_name}`)}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-slate-900">
              {student.first_name} {student.last_name}
            </h1>
            <div className="flex flex-wrap gap-2 mt-1.5">
              <Badge variant="class">{student.grade} Grade</Badge>
              {student.school && <Badge variant="school">{student.school.name}</Badge>}
            </div>
            <p className="text-sm text-slate-500 mt-2">Student ID: {student.student_id_number ?? 'N/A'}</p>
          </div>
          {/* Attendance rate */}
          <div className="text-center flex-shrink-0">
            <div className={`text-2xl font-bold ${attendanceRate >= 90 ? 'text-emerald-600' : attendanceRate >= 80 ? 'text-amber-600' : 'text-red-600'}`}>
              {attendanceRate}%
            </div>
            <p className="text-xs text-slate-500">Attendance</p>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emergency Contact */}
        <Card>
          <CardHeader className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-slate-500" />
            <span className="font-semibold text-slate-800 text-sm">Emergency Contact</span>
          </CardHeader>
          <CardBody className="space-y-2">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Name</p>
              <p className="text-sm text-slate-800 mt-0.5">{student.emergency_contact_name ?? 'Not provided'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Phone</p>
              <p className="text-sm text-slate-800 mt-0.5">{student.emergency_contact_phone ?? 'Not provided'}</p>
            </div>
          </CardBody>
        </Card>

        {/* Attendance */}
        <Card>
          <CardHeader className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span className="font-semibold text-slate-800 text-sm">Recent Attendance</span>
          </CardHeader>
          <CardBody className="p-0">
            {attendance.length === 0 ? (
              <p className="text-sm text-slate-500 px-5 py-4">No records</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {attendance.slice(0, 7).map((record) => {
                  const Icon = ATTENDANCE_ICON[record.status]
                  return (
                    <li key={record.id} className="px-5 py-2.5 flex items-center gap-3">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${ATTENDANCE_COLOR[record.status]}`} />
                      <span className="text-sm text-slate-700 flex-1">{formatDate(record.date)}</span>
                      <span className={`text-xs font-medium capitalize ${ATTENDANCE_COLOR[record.status]}`}>
                        {record.status}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardBody>
        </Card>

        {/* Classes */}
        <Card>
          <CardHeader className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-500" />
            <span className="font-semibold text-slate-800 text-sm">Classes</span>
          </CardHeader>
          <CardBody className="p-0">
            {(!student.student_classes || student.student_classes.length === 0) ? (
              <p className="text-sm text-slate-500 px-5 py-4">No classes enrolled</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {student.student_classes.map(({ class: cls }) => {
                  if (!cls) return null
                  return (
                    <li key={cls.id} className="px-5 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{cls.name}</p>
                        <p className="text-xs text-slate-500">{cls.teacher?.full_name} · {cls.period ? `Period ${cls.period}` : ''} {cls.room ?? ''}</p>
                      </div>
                      <Badge variant="class">{cls.subject}</Badge>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardBody>
        </Card>

        {/* Athletics */}
        <Card>
          <CardHeader className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-slate-500" />
            <span className="font-semibold text-slate-800 text-sm">Athletics</span>
          </CardHeader>
          <CardBody className="p-0">
            {(!student.team_memberships || student.team_memberships.length === 0) ? (
              <p className="text-sm text-slate-500 px-5 py-4">Not on any teams</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {student.team_memberships.map(({ team, jersey_number, position }) => {
                  if (!team) return null
                  return (
                    <li key={team.id} className="px-5 py-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-800">{team.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Coach: {team.coach?.full_name ?? 'TBD'}
                            {position && ` · ${position}`}
                            {jersey_number && ` · #${jersey_number}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="team">{team.sport}</Badge>
                          <p className="text-xs text-slate-400 mt-0.5">{team.season}</p>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
